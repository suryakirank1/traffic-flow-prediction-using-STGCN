import { useState, useEffect } from "react";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import PredictionChart from "./components/PredictionChart";
import ModelStatus from "./components/ModelStatus";
import PredictionSummary from "./components/PredictionSummary";

import "./App.css";
import TrafficMap from "./components/TrafficMap";

interface ModelInfo {
  model_name: string;
  description: string;
  model_loaded: boolean;
  parameters: {
    n_route: number;
    n_his: number;
    n_pred: number;
    batch_size: number;
  };
}
function App() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [predictions, setPredictions] = useState<number[][]>([]);

  // Independent loading states
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);

  const [errorPredict, setErrorPredict] = useState<string | null>(null);
  const [errorTest, setErrorTest] = useState<string | null>(null);

  const [scenario, setScenario] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<{
    score: number;
    level: string;
    explanation: string;
  } | null>(null);
  const [realInput, setRealInput] = useState<number[][]>([]);
  const [realFuture, setRealFuture] = useState<number[][]>([]);
  const [results, setResults] = useState<any>(null);
  const [trafficSignal, setTrafficSignal] = useState<any>(null);

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/model/info");
      setModelInfo(response.data);
    } catch (err) {
      console.error("Failed to fetch model info:", err);
    }
  };

  // ------------------------
  // Run STGCN Test
  // ------------------------
  const runTest = async () => {
    setLoadingTest(true);
    setErrorTest(null);
    setResults(null);

    try {
      const response = await axios.get("http://127.0.0.1:5000/api/run_test");
      setResults(response.data);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to run test";
      setErrorTest(errorMsg);
      console.error("Run test error:", err);
    } finally {
      setLoadingTest(false);
    }
  };

  // ------------------------
  // Handle Prediction
  // ------------------------
  // Inside App.tsx
  const handlePredict = async () => {
    console.log("handlePredict called");
    setLoadingPredict(true);
    setErrorPredict(null);
    setPredictions([]);
    setScenario(null);
    setConfidence(null);
    setTrafficSignal(null);

    try {
      console.log("Sending request to backend...");
      const response = await axios.post(
        "http://127.0.0.1:5000/api/predict",
        {}
      );
      console.log("Raw response:", response);
      console.log("Response data:", response.data);

      // Check if 'predictions' exists
      if (response.data.predictions) {
        console.log("Predictions found:", response.data.predictions);

        setPredictions(response.data.predictions);
        setRealInput(response.data.real_input || []);
        setRealFuture(response.data.real_future || []);
        setScenario(response.data.scenario || null);
        setConfidence(response.data.confidence || null);
      } else if (response.data.results) {
        // Some backends use 'results' instead of 'predictions'
        console.warn(
          "Backend returned 'results' instead of 'predictions'",
          response.data.results
        );
        setPredictions(response.data.results);
      } else {
        console.error("Invalid response format:", response.data);
        setErrorPredict("Invalid response format from backend");
      }
    } catch (err: any) {
      console.error("Prediction error caught:", err);

      // Axios network or backend error
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to generate predictions";

      setErrorPredict(errorMsg);
    } finally {
      setLoadingPredict(false);
      console.log("handlePredict finished, loadingPredict set to false");
    }
  };

  // ------------------------
  // Traffic Signal Recommendation
  // ------------------------
  const handleTrafficSignal = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/api/traffic_signal"
      );
      setTrafficSignal(response.data);
    } catch (err) {
      console.error("Traffic signal API error:", err);
    }
  };

  // ------------------------
  // Render Buttons with Styling
  // ------------------------
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>STGCN Traffic Flow Prediction</h1>
          <p>
            Spatio-temporal Graph Convolutional Networks for Traffic Forecasting
          </p>
        </div>
      </header>

      <main className="app-main">
        <div
          className="container"
          style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
        >
          {/* Buttons Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "2rem",
              justifyContent: "center",
            }}
          >
            {/* Predict Button */}
            <button
              onClick={handlePredict}
              disabled={loadingPredict}
              style={{
                background: loadingPredict
                  ? "#ccc"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                padding: "1rem 2rem",
                fontSize: "1rem",
                borderRadius: "12px",
                cursor: loadingPredict ? "not-allowed" : "pointer",
                boxShadow: loadingPredict
                  ? "none"
                  : "0 8px 20px rgba(102, 126, 234, 0.4)",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                if (!loadingPredict) {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(102,126,234,0.5)";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = loadingPredict
                  ? "none"
                  : "0 8px 20px rgba(102, 126, 234, 0.4)";
              }}
            >
              {loadingPredict ? "Predicting..." : "Generate Predictions"}
            </button>

            {/* Run Test Button */}
            <button
              onClick={runTest}
              disabled={loadingTest}
              style={{
                background: loadingTest
                  ? "#ccc"
                  : "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
                color: "white",
                border: "none",
                padding: "1rem 2rem",
                fontSize: "1rem",
                borderRadius: "12px",
                cursor: loadingTest ? "not-allowed" : "pointer",
                boxShadow: loadingTest
                  ? "none"
                  : "0 8px 20px rgba(255, 126, 95, 0.4)",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                if (!loadingTest) {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(255,126,95,0.5)";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = loadingTest
                  ? "none"
                  : "0 8px 20px rgba(255,126,95,0.4)";
              }}
            >
              {loadingTest ? "Running..." : "Run Model Test"}
            </button>
            <button
              onClick={handleTrafficSignal}
              style={{
                background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
                color: "white",
                border: "none",
                padding: "1rem 2rem",
                fontSize: "1rem",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(52, 211, 153, 0.4)",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 30px rgba(52,211,153,0.5)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(52, 211, 153, 0.4)";
              }}
            >
              Traffic Signal Recommendation
            </button>
          </div>

          {/* Leaflet Map Visualization */}
          {trafficSignal && (
            <div>
              <h2>Traffic Sensor Map</h2>
              <TrafficMap trafficSignal={trafficSignal} />
            </div>
          )}

          {/* Test Results */}

          {/* Prediction Chart */}
          {predictions && predictions.length > 0 && (
            <PredictionChart
              realInput={realInput}
              realFuture={realFuture}
              predictions={predictions}
            />
          )}

          {/* Prediction Summary */}
          {predictions && predictions.length > 0 && (
            <PredictionSummary predictions={predictions} />
          )}

          {/* Traffic Signal Recommendation */}

          {/* Model Info */}
          {modelInfo && <ModelStatus modelInfo={modelInfo} />}
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2025 STGCN Traffic Prediction System</p>
      </footer>
    </div>
  );
}

export default App;
