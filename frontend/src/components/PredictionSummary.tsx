interface PredictionSummaryProps {
  predictions: number[][];
}

function PredictionSummary({ predictions }: PredictionSummaryProps) {
  if (!predictions || predictions.length === 0) return null;

  const flattened = predictions.flat();
  const values = flattened.filter((v) => !isNaN(Number(v)));

  if (values.length === 0) return null;

  const mean = values.reduce((sum, v) => sum + Number(v), 0) / values.length;

  const min = Math.min(...values);
  const max = Math.max(...values);

  // Count congested: threshold < 20 km/h
  const congestedCount = values.filter((v) => v < 20).length;

  // Top 5 most congested sensors
  const sorted = [...values].sort((a, b) => a - b).slice(0, 5);

  return (
    <div
      style={{
        margin: "2rem auto",
        maxWidth: "700px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>Traffic Prediction Summary</h2>

      <p>
        • <strong>Average Predicted Speed:</strong> {mean.toFixed(2)} km/h
      </p>
      <p>
        • <strong>Minimum Predicted Speed:</strong> {min.toFixed(2)} km/h
      </p>
      <p>
        • <strong>Maximum Predicted Speed:</strong> {max.toFixed(2)} km/h
      </p>
      <p>
        • <strong>Number of Congested Sensors (speed &lt; 20 km/h):</strong>{" "}
        {congestedCount}
      </p>

      <h3 style={{ marginTop: "1.5rem" }}>
        Most Congested Locations (Lowest Speeds)
      </h3>
      <ul>
        {sorted.map((v, i) => (
          <li key={i}>
            Sensor {i + 1}: {v.toFixed(2)} km/h
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PredictionSummary;
