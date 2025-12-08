import React, { useEffect, useState } from "react";

/*
  TrafficSignalDashboard.tsx
  - Fancy animated traffic-light UI for cluster-level signals (option C)
  - Drop this file into your frontend src/components/ folder
  - Import in App.tsx and pass `results` (from /api/traffic_signal) or let it fetch directly

  Notes:
  - This is a single-file React component (TypeScript-flavor friendly).
  - Styling uses inline CSS + a small CSS block below (no external libs required).
  - If you're using Tailwind you can replace classNames accordingly.

  How to use:
  1) Add this file to src/components/TrafficSignalDashboard.tsx
  2) In App.tsx import:
       import TrafficSignalDashboard from "./components/TrafficSignalDashboard";
  3) Add <TrafficSignalDashboard /> somewhere in your layout.
     The component will call GET /api/traffic_signal and render animated lights.

  Optional props:
    - fetchUrl (string): alternate API endpoint
    - pollInterval (ms): how often to poll for new recommendations (default 10s)
*/

type SignalResult = {
  intersection_id: number;
  predicted_flow: number;
  baseline_flow: number;
  recommendation: string;
};

type Props = {
  fetchUrl?: string;
  pollInterval?: number;
};

export default function TrafficSignalDashboard({
  fetchUrl = "http://127.0.0.1:5000/api/traffic_signal",
  pollInterval = 10000,
}: Props) {
  const [data, setData] = useState<SignalResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) {
          setData(json.results || []);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || "Fetch error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    const id = setInterval(fetchData, pollInterval);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [fetchUrl, pollInterval]);

  // Determine light state from predicted vs baseline
  function computeState(pred: number, base: number) {
    // Use relative difference
    const diff = pred - base;
    const rel = base > 0 ? diff / base : 0;

    // thresholds — tune as needed
    if (rel >= 0.15) return "red"; // much higher than baseline -> congested
    if (rel >= 0.05) return "yellow"; // slightly higher
    if (rel <= -0.1) return "blue"; // much lower -> underutilized (blue means shorten green)
    return "green"; // normal
  }

  // Animated light component
  const Light = ({ state }: { state: string }) => {
    // animation patterns by state
    const pulse =
      state === "red"
        ? "pulse-slow"
        : state === "yellow"
        ? "pulse-fast"
        : state === "green"
        ? "steady"
        : "blink";
    return <div className={`ts-light ${pulse} ts-${state}`} aria-hidden />;
  };

  return (
    <div style={{ padding: 16, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h2 style={{ margin: 0, marginBottom: 12 }}>Traffic Signal Dashboard</h2>
      <p style={{ marginTop: 0, color: "#666" }}>
        Cluster-level animated signals (auto-polls every {pollInterval / 1000}s)
      </p>

      {loading && <div style={{ color: "#666" }}>Loading predictions…</div>}
      {error && <div style={{ color: "#d9534f" }}>Error: {error}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
          marginTop: 12,
        }}
      >
        {data && data.length > 0 ? (
          data.map((row) => {
            const state = computeState(row.predicted_flow, row.baseline_flow);
            return (
              <div
                key={row.intersection_id}
                style={{
                  background: "linear-gradient(180deg,#fff,#f7fafc)",
                  borderRadius: 12,
                  padding: 12,
                  boxShadow: "0 6px 18px rgba(10,20,40,0.06)",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div style={{ width: 86, textAlign: "center" }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}
                  >
                    Cluster {row.intersection_id}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ width: 40 }}>
                      <Light state={state} />
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {row.recommendation}
                  </div>
                  <div style={{ color: "#444", marginTop: 6 }}>
                    <div style={{ fontSize: 12 }}>
                      Pred: <strong>{row.predicted_flow.toFixed(2)}</strong>
                    </div>
                    <div style={{ fontSize: 12 }}>
                      Base: <strong>{row.baseline_flow.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div
                      style={{
                        height: 8,
                        background: "#eee",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            (row.predicted_flow /
                              Math.max(row.baseline_flow, 1)) *
                              100
                          )}%`,
                          height: 8,
                          background: "linear-gradient(90deg,#34d399,#10b981)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: "1 / -1", color: "#777" }}>
            No signal data yet — press the Traffic Signal Recommendation button
          </div>
        )}
      </div>

      {/* small legend */}
      <div
        style={{
          marginTop: 18,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            className="ts-light steady ts-green"
            style={{ marginRight: 8 }}
          />
          <div style={{ fontSize: 13 }}>Green — normal</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            className="ts-light pulse-fast ts-yellow"
            style={{ marginRight: 8 }}
          />
          <div style={{ fontSize: 13 }}>Yellow — moderate</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            className="ts-light pulse-slow ts-red"
            style={{ marginRight: 8 }}
          />
          <div style={{ fontSize: 13 }}>Red — congested</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="ts-light blink ts-blue" style={{ marginRight: 8 }} />
          <div style={{ fontSize: 13 }}>
            Blue — much lower than baseline (shorten green)
          </div>
        </div>
      </div>

      {/* CSS: small scoped styles */}
      <style>{`
        .ts-light { width: 40px; height: 70px; border-radius: 8px; position: relative; margin: 0 auto; box-shadow: 0 6px 14px rgba(12,20,40,0.08); display: flex; flex-direction: column; justify-content: space-around; padding: 6px; background: #222; }

        .ts-light::before, .ts-light::after { content: ''; display: block; }

        .ts-light.steady { opacity: 1; }

        .ts-light.ts-green::after { width: 20px; height: 20px; border-radius: 50%; background: #34d399; margin: 0 auto; box-shadow: 0 6px 18px rgba(52,211,153,0.35); }
        .ts-light.ts-yellow::after { width: 20px; height: 20px; border-radius: 50%; background: #f6c94d; margin: 0 auto; box-shadow: 0 6px 18px rgba(246,201,77,0.28); }
        .ts-light.ts-red::after { width: 20px; height: 20px; border-radius: 50%; background: #f87171; margin: 0 auto; box-shadow: 0 6px 18px rgba(248,113,113,0.32); }
        .ts-light.ts-blue::after { width: 20px; height: 20px; border-radius: 50%; background: #60a5fa; margin: 0 auto; box-shadow: 0 6px 18px rgba(96,165,250,0.28); }

        /* animations */
        .pulse-slow.ts-red::after { animation: pulseRed 1.8s infinite ease-in-out; }
        .pulse-fast.ts-yellow::after { animation: pulseYellow 1.1s infinite ease-in-out; }
        .blink.ts-blue::after { animation: blinkBlue 0.8s infinite steps(2); }

        .steady.ts-green::after { transform: scale(1); }

        @keyframes pulseRed { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.25); opacity: 0.85; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pulseYellow { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.9; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes blinkBlue { 0% { opacity: 1; } 50% { opacity: 0.15; transform: translateY(-2px); } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}
