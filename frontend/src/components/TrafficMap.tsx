import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
} from "react-leaflet";

type Station = {
  ID: number;
  Latitude: number;
  Longitude: number;
};

type ClusterPrediction = {
  intersection_id: number;
  predicted_flow: number;
  baseline_flow: number;
  recommendation: string;
};

export default function TrafficMap() {
  const [stations, setStations] = useState<Station[]>([]);
  const [clusters, setClusters] = useState<ClusterPrediction[]>([]);

  // Load stations
  useEffect(() => {
    fetch("/stations.json")
      .then((res) => res.json())
      .then((data) => setStations(data));
  }, []);

  // Load cluster predictions
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/traffic_signal")
      .then((res) => res.json())
      .then((json) => {
        setClusters(json.results);
      });
  }, []);

  // Dynamic radius
  function getRadius(p?: ClusterPrediction) {
    if (!p) return 5;
    const base = 5;
    const radius = base + Math.sqrt(p.predicted_flow) * 0.05;
    return Math.min(radius, 20);
  }

  // Dynamic color — blue REMOVED
  function getColor(p?: ClusterPrediction) {
    if (!p) return "#888";
    const diff = p.predicted_flow - p.baseline_flow;
    const rel = p.baseline_flow > 0 ? diff / p.baseline_flow : 0;

    if (rel >= 0.15) return "#ff0000"; // RED (heavy congestion)
    if (rel >= 0.05) return "#ffa500"; // YELLOW (moderate)
    if (rel <= -0.1) return "#00ff00"; // GREEN (much lower traffic)
    return "#00ff00"; // Default GREEN instead of blue
  }

  return (
    <div style={{ height: "500px", width: "100%", position: "relative" }}>
      {/* LEGEND UI BOX */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "white",
          padding: "10px 14px",
          zIndex: 9999,
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          fontSize: "14px",
        }}
      >
        <strong>Traffic Level Guide</strong>
        <div style={{ marginTop: 6 }}>
          <div>
            <span style={{ color: "#ff0000", fontWeight: "bold" }}>●</span> High
            Congestion (≥ 15% increase)
          </div>
          <div>
            <span style={{ color: "#ffa500", fontWeight: "bold" }}>●</span>{" "}
            Moderate Traffic (5–15% increase)
          </div>
          <div>
            <span style={{ color: "#00ff00", fontWeight: "bold" }}>●</span> Low
            / Normal Traffic (≤ 10% decrease)
          </div>
        </div>
      </div>

      <MapContainer
        center={[34.05, -118.25]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {stations.map((s, idx) => {
          if (!s.Latitude || !s.Longitude) return null;

          const clusterIndex = idx % clusters.length;
          const cluster = clusters[clusterIndex];
          if (!cluster) return null;
          const color = getColor(cluster);

          return (
            <CircleMarker
              key={s.ID}
              center={[s.Latitude, s.Longitude]}
              radius={getRadius(cluster)}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Popup>
                <div>
                  <strong>Cluster {clusterIndex + 1}</strong>
                  <br />
                  Lat: {s.Latitude}
                  <br />
                  Lon: {s.Longitude}
                  <br />
                  <strong>Predicted:</strong>{" "}
                  {cluster.predicted_flow.toFixed(0)}
                  <br />
                  <strong>Baseline:</strong> {cluster.baseline_flow.toFixed(0)}
                  <br />
                  <strong>Recommendation:</strong> {cluster.recommendation}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
