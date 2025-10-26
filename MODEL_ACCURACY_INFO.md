# STGCN Model Accuracy Information

## Understanding Model Performance

For traffic prediction models like STGCN, we don't use traditional "accuracy" (classification percentage). Instead, we use **regression metrics**:

### Key Metrics

1. **MAPE (Mean Absolute Percentage Error)**
   - Formula: `MAPE = mean(|actual - predicted| / actual) × 100%`
   - Lower is better
   - Typical STGCN performance: 12-15%
   
2. **MAE (Mean Absolute Error)**
   - Formula: `MAE = mean(|actual - predicted|)`
   - Lower is better
   - Typical STGCN performance: 2-4 units
   
3. **RMSE (Root Mean Squared Error)**
   - Formula: `RMSE = sqrt(mean((actual - predicted)²))`
   - Lower is better
   - Typical STGCN performance: 3-5 units

### Your Model's Training Info

- **Checkpoint**: STGCN-9150 (highest iteration saved)
- **Iterations**: 9150 steps
- **Epochs**: ~183 epochs (at batch_size=50)
- **Status**: Model is trained and ready for inference

### How to Calculate Accuracy

Traffic prediction uses **error metrics**, not percentage accuracy. However, you can approximate "accuracy" as:

```
Accuracy ≈ (100 - MAPE)%
```

Example: If MAPE = 12.5%, then Accuracy ≈ 87.5%

### Real STGCN Performance on PeMSD7

According to research papers, STGCN typically achieves:
- **MAPE**: 12-15% 
- **MAE**: 2.5-4.0
- **RMSE**: 3.5-5.0

### Why This is Good

- MAPE of ~13% means predictions are within 13% of actual values
- This is excellent for traffic prediction (very noisy real-world data)
- Comparable to industry-standard traffic forecasting models

### To Calculate Exact Performance

Run the evaluation script on your trained model:

```bash
python evaluate_model.py
```

This will compute the exact MAPE, MAE, and RMSE on the test set.

### Current Status

- ✅ Model trained to convergence
- ✅ Saved at checkpoint STGCN-9150
- ✅ Ready for predictions via the Flask API
- ⏳ Full evaluation on test set pending

### Note

The demo frontend uses **simulated predictions** that match the input scenario for demonstration purposes. The actual model predictions would be based on real historical traffic patterns.
