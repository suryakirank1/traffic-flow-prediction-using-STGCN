interface PredictionSummaryProps {
  predictions: number[][];
}

function PredictionSummary({ predictions }: PredictionSummaryProps) {
  if (!predictions || predictions.length === 0) return null;

  // Flatten safely
  const allValues: number[] = predictions
    .flat()
    .map((v) => parseFloat(v as any))
    .filter((v) => !isNaN(v));

  const avgSpeed =
    allValues.length > 0
      ? allValues.reduce((a, b) => a + b, 0) / allValues.length
      : 0;

  const trafficCondition = (() => {
    if (avgSpeed <= 0)
      return { level: "Unknown", color: "#718096", bg: "#e2e8f0" };
    if (avgSpeed < 20)
      return { level: "Heavy", color: "#f56565", bg: "#ffe5e5" };
    if (avgSpeed < 40)
      return { level: "Moderate", color: "#ed8936", bg: "#fff4e1" };
    return { level: "Light", color: "#48bb78", bg: "#e6fffa" };
  })();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: "2rem 0",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          width: "100%",
          maxWidth: "700px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "1rem",
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${trafficCondition.bg}, #fefefe)`,
            borderLeft: `6px solid ${trafficCondition.color}`,
            marginBottom: "1.5rem",
            boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, color: "#2d3748" }}>
              Traffic Prediction Summary
            </h2>
            <p
              style={{
                margin: "0.25rem 0 0",
                fontWeight: 600,
                color: trafficCondition.color,
              }}
            >
              Expected Traffic: {trafficCondition.level}
            </p>
          </div>
          <div
            style={{
              backgroundColor: trafficCondition.color,
              color: "#fff",
              fontWeight: 700,
              padding: "0.5rem 1rem",
              borderRadius: "12px",
              fontSize: "0.9rem",
            }}
          >
            {avgSpeed.toFixed(1)} km/h
          </div>
        </div>

        <p style={{ color: "#4a5568", marginBottom: "1rem", lineHeight: 1.6 }}>
          Over the next 45 minutes, traffic across 228 major routes is expected
          to be{" "}
          <strong style={{ color: trafficCondition.color }}>
            {trafficCondition.level.toLowerCase()}
          </strong>
          .
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {trafficCondition.level === "Light" && (
            <p style={{ color: "#38a169", fontWeight: 500 }}>
              ✅ Great time to travel! Roads are mostly clear.
            </p>
          )}
          {trafficCondition.level === "Moderate" && (
            <p style={{ color: "#ed8936", fontWeight: 500 }}>
              ⚠️ Traffic is moderate. Consider alternate routes if possible.
            </p>
          )}
          {trafficCondition.level === "Heavy" && (
            <p style={{ color: "#f56565", fontWeight: 500 }}>
              ⛔ Heavy traffic expected. Plan ahead or delay your trip.
            </p>
          )}
          {trafficCondition.level === "Unknown" && (
            <p style={{ color: "#718096", fontWeight: 500 }}>
              ℹ️ Data unavailable for current prediction.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PredictionSummary;
