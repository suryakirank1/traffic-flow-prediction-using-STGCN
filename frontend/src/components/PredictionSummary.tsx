import './PredictionSummary.css'

interface PredictionSummaryProps {
  predictions: number[][]
}

function PredictionSummary({ predictions }: PredictionSummaryProps) {
  if (!predictions || predictions.length === 0) {
    return null
  }

  // Extract all values from predictions
  const allValues: number[] = []
  predictions.forEach(timestep => {
    if (Array.isArray(timestep)) {
      timestep.forEach((routeData: any) => {
        if (Array.isArray(routeData)) {
          routeData.forEach((value: any) => {
            const numValue = typeof value === 'number' ? value : parseFloat(value)
            if (!isNaN(numValue)) {
              allValues.push(numValue)
            }
          })
        }
      })
    }
  })

  if (allValues.length === 0) {
    return null
  }

  const sorted = [...allValues].sort((a, b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length

  // Determine traffic condition
  const getTrafficCondition = (avgFlow: number) => {
    if (avgFlow < -1) return { level: 'Very Light', color: '#48bb78' }
    if (avgFlow < 0) return { level: 'Light', color: '#38a169' }
    if (avgFlow < 0.5) return { level: 'Moderate', color: '#ed8936' }
    if (avgFlow < 1) return { level: 'Heavy', color: '#f56565' }
    return { level: 'Very Heavy', color: '#e53e3e' }
  }

  const trafficCondition = getTrafficCondition(avg)

  return (
    <div className="prediction-summary">
      <div className="summary-card">
        <h2>What This Means for You</h2>
        
        <div className="traffic-status" style={{ borderLeftColor: trafficCondition.color }}>
          <div className="status-header">
            <h3>Expected Traffic: {trafficCondition.level}</h3>
          </div>
          <p className="status-description">
            Over the next 45 minutes, traffic across 228 major routes is expected to be <strong>{trafficCondition.level.toLowerCase()}</strong>.
          </p>
        </div>

        <div className="summary-points">
          <div className="point">
            <div>
              <strong>Next 45 Minutes</strong>
              <p>The system predicts traffic flow for the next 45 minutes, broken down into 5-minute intervals.</p>
            </div>
          </div>
          
          <div className="point">
            <div>
              <strong>228 Routes Monitored</strong>
              <p>This covers 228 major traffic routes in the area, giving you a comprehensive view of traffic conditions.</p>
            </div>
          </div>

          <div className="point">
            <div>
              <strong>Data-Driven Predictions</strong>
              <p>Predictions are based on historical traffic patterns and real-time data analysis.</p>
            </div>
          </div>
        </div>

        <div className="best-time">
          <h4>Planning Your Trip?</h4>
          <p>
            Current conditions suggest {trafficCondition.level === 'Light' || trafficCondition.level === 'Very Light' 
              ? 'it\'s a great time to travel!' 
              : 'you might want to consider alternative times or routes.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PredictionSummary
