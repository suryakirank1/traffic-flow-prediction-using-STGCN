import { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import PredictionChart from './components/PredictionChart'
import ModelStatus from './components/ModelStatus'
import PredictionSummary from './components/PredictionSummary'
import './App.css'

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

function App() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [predictions, setPredictions] = useState<number[][]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scenario, setScenario] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<{score: number, level: string, explanation: string} | null>(null)

  useEffect(() => {
    fetchModelInfo()
  }, [])

  const fetchModelInfo = async () => {
    try {
      const response = await axios.get('/api/model/info')
      setModelInfo(response.data)
    } catch (err) {
      console.error('Failed to fetch model info:', err)
    }
  }

  const handlePredict = async () => {
    setLoading(true)
    setError(null)
    setPredictions([])
    setScenario(null)
    setConfidence(null)
    
    try {
      const response = await axios.post('/api/predict', {})
      console.log('Prediction response:', response.data)
      
      if (response.data.predictions) {
        setPredictions(response.data.predictions)
        setScenario(response.data.scenario || null)
        setConfidence(response.data.confidence || null)
      } else {
        setError('Invalid response format')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to generate predictions'
      setError(errorMsg)
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  try {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1>STGCN Traffic Flow Prediction</h1>
            <p>Spatio-temporal Graph Convolutional Networks for Traffic Forecasting</p>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
            {/* Predict Button at the Top */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px', 
              padding: '2.5rem', 
              marginBottom: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <h2 style={{ marginTop: 0, color: '#2c3e50', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
                Get Traffic Predictions
              </h2>
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
                Click the button below to predict traffic flow for the next 45 minutes across 228 routes.
              </p>
              {scenario && (
                <div style={{ 
                  padding: '1rem 1.25rem', 
                  background: 'rgba(102, 126, 234, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                  <strong style={{ color: '#667eea', fontSize: '0.9rem' }}>Simulation Scenario: </strong>
                  <span style={{ color: '#2c3e50', fontWeight: '600' }}>{scenario}</span>
                  <p style={{ 
                    margin: '0.5rem 0 0 0', 
                    fontSize: '0.85rem', 
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    (This shows the input traffic condition that was used to generate the prediction)
                  </p>
                </div>
              )}
              {confidence && (
                <div style={{ 
                  padding: '1rem 1.25rem', 
                  background: confidence.score >= 90 ? 'rgba(46, 125, 50, 0.1)' : 'rgba(255, 183, 77, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  border: `1px solid ${confidence.score >= 90 ? 'rgba(46, 125, 50, 0.2)' : 'rgba(255, 183, 77, 0.2)'}`,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                  <strong style={{ color: confidence.score >= 90 ? '#2e7d32' : '#f57c00', fontSize: '0.9rem' }}>Model Confidence: </strong>
                  <span style={{ 
                    color: '#2c3e50',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}>
                    {confidence.score}% ({confidence.level})
                  </span>
                  <p style={{ 
                    margin: '0.5rem 0 0 0', 
                    fontSize: '0.85rem', 
                    color: '#666'
                  }}>
                    {confidence.explanation}
                  </p>
                </div>
              )}
              <button
                onClick={handlePredict}
                disabled={loading}
                style={{
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1.25rem 2.5rem',
                  fontSize: '0.9rem',
                  borderRadius: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  transition: 'all 0.3s ease',
                  minWidth: '250px',
                  boxShadow: loading ? 'none' : '0 10px 30px rgba(102, 126, 234, 0.4)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.5)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = loading ? 'none' : '0 10px 30px rgba(102, 126, 234, 0.4)'
                }}
              >
                {loading ? 'Predicting...' : 'Generate Predictions'}
              </button>
              {error && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: '#fee', 
                  borderRadius: '8px',
                  color: '#c33'
                }}>
                  {error}
                </div>
              )}
            </div>

            {/* Human Language Summary */}
            {predictions && predictions.length > 0 && (
              <PredictionSummary predictions={predictions} />
            )}

            {/* Prediction Chart */}
            {predictions && predictions.length > 0 && (
              <PredictionChart predictions={predictions} />
            )}

            {/* Model Information */}
            {modelInfo && <ModelStatus modelInfo={modelInfo} />}


          </div>
        </main>

        <footer className="app-footer">
          <p>© 2024 STGCN Traffic Prediction System</p>
        </footer>
      </div>
    )
  } catch (err) {
    console.error('App render error:', err)
    return (
      <div className="app">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Error occurred</h1>
          <p>{err instanceof Error ? err.message : 'Unknown error'}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    )
  }
}

export default App
