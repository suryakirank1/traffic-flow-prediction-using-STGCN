import './Dashboard.css'

interface DashboardProps {
  onPredict: () => void
  loading: boolean
  error: string | null
}

function Dashboard({ onPredict, loading, error }: DashboardProps) {
  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <div className="card-content">
          <h2>Traffic Flow Prediction</h2>
          <p className="description">
            Generate predictions for traffic flow across 228 routes in the next 9 time steps
            using the STGCN model. Each time step represents a 5-minute interval.
          </p>

          <div className="controls">
            <button 
              onClick={onPredict} 
              disabled={loading}
              className="predict-button"
            >
              {loading ? 'Predicting...' : 'Generate Predictions'}
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="info-section">
            <div className="info-box">
              <h3>How it works</h3>
              <ul>
                <li>Uses historical traffic data (12 time steps)</li>
                <li>Predicts traffic flow for next 9 time steps</li>
                <li>Leverages spatio-temporal graph convolution</li>
                <li>Analyzes relationships between 228 routes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
