# utils/traffic_signal.py

import numpy as np

def aggregate_by_cluster(pred, clusters):
    """
    pred: shape (228,)  -> predicted flow for each sensor
    clusters: array of length 228 with cluster IDs
    returns: aggregated average flow per cluster
    """
    num_clusters = int(clusters.max()) + 1
    region_flows = []
    pred = np.array(pred).reshape(-1)

    for c in range(num_clusters):
        idx = np.where(clusters == c)[0]
        if len(idx) == 0:
            region_flows.append(0)
        else:
            # pred is 1D → no :
            region_flows.append(float(pred[idx].mean()))

    return region_flows



def green_time_change(pred_flow, baseline_flow):
    change = (pred_flow - baseline_flow) / (baseline_flow + 1e-6)

    if change > 0.3:
        return "+5s green"
    elif change < -0.2:
        return "-5s green"
    else:
        return "no change"
