import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import './PredictionChart.css'

interface PredictionChartProps {
  predictions: number[][]
}

function PredictionChart({ predictions }: PredictionChartProps) {
  const chartData = useMemo(() => {
    try {
      // Convert predictions to chart-friendly format
      const data: any[] = []
      
      if (!predictions || predictions.length === 0) {
        return data
      }
      
      for (let timeStep = 0; timeStep < predictions.length; timeStep++) {
        const timestepData: any = { 
          name: `T+${timeStep + 1}`,
          min: Infinity,
          max: -Infinity,
          avg: 0
        }
        
        let sum = 0
        let count = 0
        
        // Handle nested structure
        // Predictions could be: predictions[timestep] = [[route0_val], [route1_val], ...]
        if (Array.isArray(predictions[timeStep])) {
          predictions[timeStep].forEach((routeData: any) => {
            if (Array.isArray(routeData)) {
              routeData.forEach((value: any) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value)
                if (!isNaN(numValue)) {
                  sum += numValue
                  count++
                  timestepData.min = Math.min(timestepData.min, numValue)
                  timestepData.max = Math.max(timestepData.max, numValue)
                }
              })
            } else if (typeof routeData === 'number') {
              // Handle flat array: predictions[timestep] = [route0_val, route1_val, ...]
              if (!isNaN(routeData)) {
                sum += routeData
                count++
                timestepData.min = Math.min(timestepData.min, routeData)
                timestepData.max = Math.max(timestepData.max, routeData)
              }
            }
          })
        }
        
        timestepData.avg = count > 0 ? sum / count : 0
        
        // Handle case where min/max weren't set
        if (timestepData.min === Infinity) timestepData.min = 0
        if (timestepData.max === -Infinity) timestepData.max = 0
        
        data.push(timestepData)
      }
      
      return data
    } catch (error) {
      console.error('Error processing chart data:', error)
      return []
    }
  }, [predictions])

  // Calculate statistics
  const stats = useMemo(() => {
    try {
      const allValues: number[] = []
      
      if (!predictions || predictions.length === 0) {
        return { mean: 0, median: 0, min: 0, max: 0 }
      }
      
      predictions.forEach(timestep => {
        if (Array.isArray(timestep)) {
          timestep.forEach((routeData: any) => {
            if (Array.isArray(routeData)) {
              // Handle nested: [[route0_val], [route1_val], ...]
              routeData.forEach((value: any) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value)
                if (!isNaN(numValue)) {
                  allValues.push(numValue)
                }
              })
            } else if (typeof routeData === 'number') {
              // Handle flat: [route0_val, route1_val, ...]
              if (!isNaN(routeData)) {
                allValues.push(routeData)
              }
            }
          })
        }
      })
      
      if (allValues.length === 0) {
        return { mean: 0, median: 0, min: 0, max: 0 }
      }
      
      const sorted = [...allValues].sort((a, b) => a - b)
      const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length
      const median = sorted[Math.floor(sorted.length / 2)]
      const min = sorted[0]
      const max = sorted[sorted.length - 1]
      
      // Ensure all values are valid numbers
      return {
        mean: isNaN(mean) ? 0 : mean,
        median: isNaN(median) ? 0 : median,
        min: isNaN(min) ? 0 : min,
        max: isNaN(max) ? 0 : max
      }
    } catch (error) {
      console.error('Error calculating stats:', error)
      return { mean: 0, median: 0, min: 0, max: 0 }
    }
  }, [predictions])

  if (!chartData || chartData.length === 0) {
    return (
      <div className="prediction-chart">
        <div className="chart-card">
          <h2>Prediction Results</h2>
          <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No prediction data available. Please generate predictions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="prediction-chart">
      <div className="chart-card">
        <h2>Prediction Results</h2>
        
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">Average Flow</div>
            <div className="stat-value">{Number(stats.mean).toFixed(2)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Median Flow</div>
            <div className="stat-value">{Number(stats.median).toFixed(2)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Min Flow</div>
            <div className="stat-value">{Number(stats.min).toFixed(2)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Max Flow</div>
            <div className="stat-value">{Number(stats.max).toFixed(2)}</div>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avg" 
                stroke="#667eea" 
                strokeWidth={2}
                name="Average Flow"
              />
              <Line 
                type="monotone" 
                dataKey="min" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Minimum Flow"
              />
              <Line 
                type="monotone" 
                dataKey="max" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Maximum Flow"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-legend">
          <p>Showing traffic flow predictions across 228 routes for 9 future time steps (5 minutes each).</p>
        </div>
      </div>
    </div>
  )
}

export default PredictionChart
