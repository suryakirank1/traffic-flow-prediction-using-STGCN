import { useMemo } from "react";
import { ReferenceLine } from "recharts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./PredictionChart.css";

interface PredictionChartProps {
  predictions: number[][];
  realFuture: number[][];
  realInput: number[][];
}

function PredictionChart({
  realFuture,
  realInput,
  predictions,
}: PredictionChartProps) {
  const chartData = useMemo(() => {
    try {
      const data: any[] = [];

      // Helper to calculate min, max, avg for each timestep
      const summarizeTimestep = (timestep: any[], label: string) => {
        let sum = 0,
          count = 0;
        let min = Infinity,
          max = -Infinity;

        timestep.forEach((routeData: any) => {
          const values = Array.isArray(routeData) ? routeData : [routeData];
          values.forEach((v: any) => {
            const num = typeof v === "number" ? v : parseFloat(v);
            if (!isNaN(num)) {
              sum += num;
              count++;
              min = Math.min(min, num);
              max = Math.max(max, num);
            }
          });
        });

        return {
          name: label,
          avg: count > 0 ? sum / count : 0,
          min: min === Infinity ? 0 : min,
          max: max === -Infinity ? 0 : max,
        };
      };

      // Add real input (past 12 timesteps)
      if (realInput && realInput.length > 0) {
        realInput.forEach((timestep, i) => {
          data.push(summarizeTimestep(timestep, `T-${realInput.length - i}`));
        });
      }

      // Add predictions (future 9 timesteps)
      if (predictions && predictions.length > 0) {
        predictions.forEach((timestep, i) => {
          data.push(summarizeTimestep(timestep, `P+${i + 1}`));
        });
      }

      return data;
    } catch (error) {
      console.error("Error processing chart data:", error);
      return [];
    }
  }, [realInput, predictions]);

  // Calculate statistics
  const sampleSensorData = useMemo(() => {
    const data: any[] = [];

    // Real future values (ground truth)
    if (realFuture && realFuture.length > 0) {
      realFuture.forEach((timestep, i) => {
        data.push({
          name: `T+${i + 1}`,
          real: timestep[0], // sensor 0
          predicted: null,
        });
      });
    }

    // Predicted values (model output)
    if (predictions && predictions.length > 0) {
      predictions.forEach((timestep, i) => {
        // Align same timeline if both exist
        if (data[i]) data[i].predicted = timestep[0][0];
        else
          data.push({
            name: `P+${i + 1}`,
            real: null,
            predicted: timestep[0][0],
          });
      });
    }

    return data;
  }, [realFuture, predictions]);

  const stats = useMemo(() => {
    try {
      const allValues: number[] = [];

      if (!predictions || predictions.length === 0) {
        return { mean: 0, median: 0, min: 0, max: 0 };
      }

      predictions.forEach((timestep) => {
        if (Array.isArray(timestep)) {
          timestep.forEach((routeData: any) => {
            if (Array.isArray(routeData)) {
              // Handle nested: [[route0_val], [route1_val], ...]
              routeData.forEach((value: any) => {
                const numValue =
                  typeof value === "number" ? value : parseFloat(value);
                if (!isNaN(numValue)) {
                  allValues.push(numValue);
                }
              });
            } else if (typeof routeData === "number") {
              // Handle flat: [route0_val, route1_val, ...]
              if (!isNaN(routeData)) {
                allValues.push(routeData);
              }
            }
          });
        }
      });

      if (allValues.length === 0) {
        return { mean: 0, median: 0, min: 0, max: 0 };
      }

      const sorted = [...allValues].sort((a, b) => a - b);
      const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
      const median = sorted[Math.floor(sorted.length / 2)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];

      // Ensure all values are valid numbers
      return {
        mean: isNaN(mean) ? 0 : mean,
        median: isNaN(median) ? 0 : median,
        min: isNaN(min) ? 0 : min,
        max: isNaN(max) ? 0 : max,
      };
    } catch (error) {
      console.error("Error calculating stats:", error);
      return { mean: 0, median: 0, min: 0, max: 0 };
    }
  }, [predictions]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="prediction-chart">
        <div className="chart-card">
          <h2>Prediction Results</h2>
          <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            No prediction data available. Please generate predictions.
          </p>
        </div>
      </div>
    );
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
        <div className="chart-card" style={{ marginTop: "40px" }}>
          <h2>Ground Truth vs Predicted (Sample Sensor)</h2>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sampleSensorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="real"
                stroke="#00C49F"
                name="Real Flow"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#FF8042"
                name="Predicted Flow"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-legend">
          <p>
            Showing traffic flow predictions across 228 routes for 9 future time
            steps (5 minutes each).
          </p>
        </div>
      </div>
    </div>
  );
}

export default PredictionChart;
