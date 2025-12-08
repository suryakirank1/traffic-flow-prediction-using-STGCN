# utils/clustering.py
import numpy as np
from sklearn.cluster import SpectralClustering

def load_adj(path):
    return np.load(path)  # or CSV

def compute_clusters(adj, k=12):
    clusters = SpectralClustering(
        n_clusters=k,
        affinity='precomputed',
        assign_labels="kmeans",
        random_state=42
    ).fit_predict(adj)
    return clusters
