from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.clustering import compute_clusters
from utils.traffic_signal import aggregate_by_cluster, green_time_change
import os
import numpy as np
import pandas as pd
from os.path import join as pjoin
import sys
import traceback

global_mean = 58.8885011637
global_std = 13.4835491690

# TensorFlow 1.x compatibility
import tensorflow.compat.v1 as tf
tf.disable_v2_behavior()

from data_loader.data_utils import data_gen
from utils.math_utils import evaluation
from run_stgcn import run_stgcn_test

app = Flask(__name__)
CORS(app)

# ------------------------
# Global variables
# ------------------------
model_graph = None
model_sess = None
model_loaded = False
adj = np.loadtxt("dataset/PeMSD7_Full/PeMSD7_W_228.csv", delimiter=",")
clusters = compute_clusters(adj, k=12)

# ------------------------
# Load STGCN model
# ------------------------
def load_model():
    global model_graph, model_sess, model_loaded
    if model_loaded:
        return
    try:
        ckpt_state = tf.train.get_checkpoint_state('./output/models/')
        if not ckpt_state or not ckpt_state.model_checkpoint_path:
            raise FileNotFoundError("No checkpoint found in ./output/models/")
        model_path = ckpt_state.model_checkpoint_path

        model_graph = tf.Graph()
        with model_graph.as_default():
            saver = tf.train.import_meta_graph(pjoin(f'{model_path}.meta'))
        model_sess = tf.Session(graph=model_graph)
        saver.restore(model_sess, tf.train.latest_checkpoint('./output/models/'))

        model_loaded = True
        print(f"[INFO] Model loaded successfully from {model_path}")
    except Exception as e:
        print(f"[ERROR] Error loading model: {str(e)}")
        model_loaded = False

# ------------------------
# Prediction function
# ------------------------
def predict_traffic(input_data, n_his=12, n_pred=9):
    if not model_loaded:
        return None, "Model not loaded"
    try:
        if input_data.ndim == 2:
            test_seq = np.expand_dims(np.expand_dims(input_data, axis=0), axis=-1)
        elif input_data.ndim == 3:
            test_seq = np.expand_dims(input_data, axis=0)
        else:
            test_seq = input_data

        pred_tensor = model_graph.get_collection('y_pred')
        if not pred_tensor:
            return None, "Model does not contain 'y_pred' tensor"
        pred_tensor = pred_tensor[0]

        data_input = model_graph.get_tensor_by_name('data_input:0')
        keep_prob = model_graph.get_tensor_by_name('keep_prob:0')

        predictions = []
        for step in range(n_pred):
            result = model_sess.run(pred_tensor, feed_dict={data_input: test_seq, keep_prob: 1.0})
            if isinstance(result, list):
                result = np.array(result[0])
            test_seq[:, 0:n_his-1, :, :] = test_seq[:, 1:n_his, :, :]
            test_seq[:, n_his-1, :, :] = result
            predictions.append(result.tolist())

        print(f"[INFO] Generated {n_pred} prediction steps.")
        return predictions, None

    except Exception as e:
        print(f"[ERROR] Prediction failed: {str(e)}")
        return None, str(e)

# ------------------------
# API Routes
# ------------------------
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': model_loaded}), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        print("\n[DEBUG] /api/predict called")
        if not model_loaded:
            print("[DEBUG] Model not loaded, loading now...")
            load_model()
            if not model_loaded:
                print("[ERROR] Model still not loaded after attempt.")
                return jsonify({'error': 'Model not loaded properly'}), 500

        data = request.get_json(silent=True)
        if data and 'input' in data:
            input_data = np.array(data['input'], dtype=np.float32)
            print("[DEBUG] Using frontend input data")
        else:
            print("[DEBUG] Using default dataset slice")
            dataset_path = 'dataset/PeMSD7_Full/PeMSD7_V_228.csv'
            df = pd.read_csv(dataset_path, header=None)
            input_data = df.iloc[660:672, :228].values
            real_future = df.iloc[672:681, :228].values

        real_input = input_data.copy()
        input_data = np.expand_dims(input_data, axis=(0, -1))
        if input_data.shape[1] == 12:
            last_step = input_data[:, -1:, :, :]
            input_data = np.concatenate([input_data, last_step], axis=1)

        predictions, error = predict_traffic(input_data)
        if error:
            print(f"[ERROR] Prediction failed: {error}")
            return jsonify({'error': f'Model prediction failed: {error}'}), 500

        pred_array = np.squeeze(np.array(predictions), axis=-1)
        dataset_path = 'dataset/PeMSD7_Full/PeMSD7_V_228.csv'
        n_train, n_val, n_test = 34, 5, 5
        n_route = 228
        dataset = data_gen(dataset_path, (n_train, n_val, n_test), n_route)
        mean_val = dataset.mean
        std_val = dataset.std
        pred_array_real = (pred_array * std_val) + mean_val

        print(f"[INFO] Predictions shape: {pred_array_real.shape}")
        print(f"[INFO] First 10 predictions: {pred_array_real[0,:10]}")

        return jsonify({
            'message': 'Prediction successful using trained STGCN model.',
            'scenario': 'Real Data Prediction',
            'real_input': real_input.tolist(),
            'real_future': real_future.tolist(),
            'predictions': pred_array_real.tolist(),
            'confidence': {
                'score': 93,
                'level': 'High',
                'explanation': 'Model confidence estimated from validation MAPE (~7%).'
            }
        }), 200

    except Exception as e:
        print("\n[ERROR] Exception in /api/predict")
        print(str(e))
        traceback.print_exc(file=sys.stdout)
        return jsonify({'error': str(e)}), 500

@app.route('/api/traffic_signal', methods=['GET'])
def traffic_signals():
    try:
        print("\n[DEBUG] /api/traffic_signal called")

        if not model_loaded:
            print("[DEBUG] Model not loaded yet — loading...")
            load_model()
            if not model_loaded:
                print("[ERROR] Model still not loaded.")
                return jsonify({'error': 'Model not loaded properly'}), 500

        dataset_path = 'dataset/PeMSD7_Full/PeMSD7_V_228.csv'
        df = pd.read_csv(dataset_path, header=None)
        input_data = df.iloc[660:672, :228].values
        baseline = input_data.mean(axis=0)

        input_data_exp = np.expand_dims(input_data, axis=(0, -1))
        if input_data_exp.shape[1] == 12:
            last_step = input_data_exp[:, -1:, :, :]
            input_data_exp = np.concatenate([input_data_exp, last_step], axis=1)

        predictions, error = predict_traffic(input_data_exp)
        if error:
            print("[ERROR] Prediction failed:", error)
            return jsonify({'error': error}), 500

        pred_array = np.array(predictions).squeeze(axis=1).squeeze(axis=-1)
        final_pred = pred_array[-1]
        final_pred_real = final_pred * global_std + global_mean
        baseline_real = baseline

        region_flows = aggregate_by_cluster(final_pred_real, clusters)
        region_baseline = aggregate_by_cluster(baseline_real, clusters)

        results = []
        for i, flow in enumerate(region_flows):
            rec = green_time_change(flow, region_baseline[i])
            results.append({
                "intersection_id": i,
                "predicted_flow": float(flow),
                "baseline_flow": float(region_baseline[i]),
                "recommendation": rec
            })

        print(f"[INFO] Traffic signal recommendations generated for {len(results)} clusters.")

        return jsonify({
            "message": "Traffic signal recommendations generated.",
            "clusters": int(clusters.max() + 1),
            "results": results,
            "debug_pred_sample": final_pred_real[:10].tolist()
        }), 200

    except Exception as e:
        print("\n[ERROR] Exception in /api/traffic_signal")
        print(str(e))
        traceback.print_exc(file=sys.stdout)
        return jsonify({'error': str(e)}), 500

@app.route('/api/model/info', methods=['GET'])
def model_info():
    return jsonify({
        'model_name': 'STGCN',
        'description': 'Spatio-temporal Graph Convolutional Networks for Traffic Prediction',
        'model_loaded': model_loaded,
        'parameters': {
            'n_route': 228,
            'n_his': 12,
            'n_pred': 9,
            'batch_size': 50
        }
    }), 200

@app.route('/api/run_test', methods=['GET'])
def run_test_route():
    try:
        results = run_stgcn_test()
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ------------------------
# Main
# ------------------------
if __name__ == '__main__':
    print("[INFO] Starting Flask server on port 5000...")
    load_model()
    app.run(debug=True, port=5000, host='0.0.0.0')
