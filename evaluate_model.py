"""
Model Evaluation Script
Calculate MAPE, MAE, and RMSE for the trained STGCN model
"""
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "0"

from os.path import join as pjoin
import tensorflow.compat.v1 as tf
tf.disable_v2_behavior()

import numpy as np
import time
from utils.math_graph import *
from data_loader.data_utils import *
from utils.math_utils import evaluation

# Model parameters
n_route = 228
n_his = 12
n_pred = 9
batch_size = 50
Ks, Kt = 3, 3
blocks = [[1, 32, 64], [64, 32, 128]]

# Dataset path
dataset_dir = "./dataset/PeMSD7_Full"

# Load weighted adjacency matrix W
W = weight_matrix(pjoin(dataset_dir, f'PeMSD7_W_{n_route}.csv'))

# Calculate graph kernel
L = scaled_laplacian(W)
Lk = cheb_poly_approx(L, Ks, n_route)
tf.add_to_collection(name='graph_kernel', value=tf.cast(tf.constant(Lk), tf.float32))

# Data Preprocessing
data_file = f'PeMSD7_V_{n_route}.csv'
n_train, n_val, n_test = 34, 5, 5
PeMS = data_gen(pjoin(dataset_dir, data_file), (n_train, n_val, n_test), n_route, n_his + n_pred)
print(f'>> Loading dataset with Mean: {PeMS.mean:.2f}, STD: {PeMS.std:.2f}')

# Load model
print(">> Loading model...")
model_path = tf.train.get_checkpoint_state('./output/models/').model_checkpoint_path
print(f"Model path: {model_path}")

test_graph = tf.Graph()
with test_graph.as_default():
    saver = tf.train.import_meta_graph(pjoin(f'{model_path}.meta'))

with tf.Session(graph=test_graph) as test_sess:
    saver.restore(test_sess, tf.train.latest_checkpoint('./output/models/'))
    print(f'>> Model loaded successfully from {model_path}')
    
    pred = test_graph.get_collection('y_pred')
    
    # Test on test set
    print("\n>> Evaluating on TEST set...")
    step_idx = n_pred - 1
    
    x_test, x_stats = PeMS.get_data('test'), PeMS.get_stats()
    
    # Generate predictions
    y_test = []
    for i in range(min(10, len(x_test))):  # Test on first 10 samples
        test_seq = np.copy(x_test[i:i+1, 0:n_his + 1, :, :])
        predictions = []
        
        for j in range(n_pred):
            pred_result = test_sess.run(pred, feed_dict={'data_input:0': test_seq, 'keep_prob:0': 1.0})
            if isinstance(pred_result, list):
                pred_result = np.array(pred_result[0])
            
            # Slide window
            test_seq[:, 0:n_his - 1, :, :] = test_seq[:, 1:n_his, :, :]
            test_seq[:, n_his - 1, :, :] = pred_result
            predictions.append(pred_result)
        
        # Get prediction for step_idx
        y_test.append(predictions[step_idx])
    
    y_test = np.concatenate(y_test, axis=0)
    
    # Calculate metrics
    ground_truth = x_test[0:len(y_test), step_idx + n_his, :, :]
    evl = evaluation(ground_truth, y_test, x_stats)
    
    print("\n" + "="*60)
    print("MODEL PERFORMANCE METRICS")
    print("="*60)
    print(f"Mean Absolute Percentage Error (MAPE): {evl[0]:7.3%}")
    print(f"Mean Absolute Error (MAE):           {evl[1]:4.3f}")
    print(f"Root Mean Squared Error (RMSE):      {evl[2]:6.3f}")
    print("="*60)
    
    # Calculate accuracy as (100 - MAPE)%
    accuracy = (1 - evl[0]) * 100
    print(f"\nModel Accuracy (100 - MAPE): {accuracy:.2f}%")
    print("="*60)
