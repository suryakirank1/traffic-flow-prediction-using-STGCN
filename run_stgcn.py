import os
import json
from os.path import join as pjoin
import tensorflow as tf

from utils.math_graph import *
from data_loader.data_utils import *
from models.tester import model_test


def run_stgcn_test():
    """
    Runs STGCN test phase, loads graph, dataset, and model,
    and returns performance metrics in JSON-ready format.
    """
    # ---------- GPU CONFIG ----------
    os.environ["CUDA_VISIBLE_DEVICES"] = "0"
    config = tf.ConfigProto()
    config.gpu_options.allow_growth = True
    tf.Session(config=config)

    # ---------- MODEL CONFIG ----------
    n = 228          # Number of sensors (routes)
    n_his = 12       # Historical time steps
    n_pred = 9       # Prediction horizon
    Ks, Kt = 3, 3    # Graph and temporal kernel sizes
    dataset_dir = r"C:\Users\Surya Kiran K\Desktop\traffic flow prediction\STGCN_IJCAI-18\dataset\PeMSD7_Full"
    model_path = './output/models/'

    print(">> Initializing STGCN testing pipeline...")
    print(f">> Using dataset from: {dataset_dir}")

    # ---------- LOAD GRAPH ----------
    try:
        W = weight_matrix(pjoin(dataset_dir, f'PeMSD7_W_{n}.csv'))
        L = scaled_laplacian(W)
        Lk = cheb_poly_approx(L, Ks, n)
        tf.add_to_collection(name='graph_kernel', value=tf.cast(tf.constant(Lk), tf.float32))
        print(">> Graph kernel successfully computed.")
    except Exception as e:
        print(f"⚠️ Error loading graph: {e}")
        return {"status": "error", "message": str(e)}

    # ---------- LOAD DATA ----------
    try:
        data_file = f'PeMSD7_V_{n}.csv'
        n_train, n_val, n_test = 34, 5, 5
        PeMS = data_gen(pjoin(dataset_dir, data_file), (n_train, n_val, n_test), n, n_his + n_pred)
        print(f'>> Dataset loaded successfully with Mean: {PeMS.mean:.2f}, STD: {PeMS.std:.2f}')
    except Exception as e:
        print(f"⚠️ Error loading dataset: {e}")
        return {"status": "error", "message": str(e)}

    # ---------- RUN MODEL TEST ----------
    try:
        print(">> Running model evaluation ...")
        test_results = model_test(PeMS, PeMS.get_len('test'), n_his, n_pred, inf_mode='merge', load_path=model_path)

        if not isinstance(test_results, dict):
            raise ValueError("model_test() did not return a dictionary result.")

        print("\n✅ Test completed successfully!")
        print(json.dumps(test_results, indent=2))

        return test_results

    except Exception as e:
        print(f"⚠️ Model test failed: {e}")
        return {"status": "error", "message": str(e)}


# ---------- CLI RUN ----------
if __name__ == "__main__":
    results = run_stgcn_test()

    # Save to a JSON file (optional, useful for debugging/frontend use)
    os.makedirs("results", exist_ok=True)
    with open("results/test_results.json", "w") as f:
        json.dump(results, f, indent=2)

    print("\n📁 Results saved to results/test_results.json")
