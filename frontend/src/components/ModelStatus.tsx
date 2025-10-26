import './ModelStatus.css'

interface ModelInfo {
  model_name: string
  description: string
  model_loaded: boolean
  parameters: {
    n_route: number
    n_his: number
    n_pred: number
    batch_size: number
  }
}

interface ModelStatusProps {
  modelInfo: ModelInfo | null
}

function ModelStatus({ modelInfo }: ModelStatusProps) {
  return (
    <div className="model-status">
      <div className="status-card">
        {!modelInfo ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading model information...</p>
          </div>
        ) : (
          <>
            <div className="status-header">
              <h2>Model Information</h2>
              <div className={`status-badge ${modelInfo.model_loaded ? 'loaded' : 'not-loaded'}`}>
                {modelInfo.model_loaded ? 'Ready' : 'Not Loaded'}
              </div>
            </div>

            <div className="model-details">
              <div className="detail-row">
                <span className="detail-label">Model Name:</span>
                <span className="detail-value">{modelInfo.model_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{modelInfo.description}</span>
              </div>
              
              <div className="parameters-section">
                <h3>Model Parameters</h3>
                <div className="params-grid">
                  <div className="param-item">
                    <span className="param-label">Routes (n_route)</span>
                    <span className="param-value">{modelInfo.parameters.n_route}</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">History Steps (n_his)</span>
                    <span className="param-value">{modelInfo.parameters.n_his}</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">Prediction Steps (n_pred)</span>
                    <span className="param-value">{modelInfo.parameters.n_pred}</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">Batch Size</span>
                    <span className="param-value">{modelInfo.parameters.batch_size}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ModelStatus
