# STGCN Frontend

A modern React + TypeScript frontend for the STGCN Traffic Flow Prediction system.

## Features

- 🎨 Modern, responsive UI with gradient design
- 📊 Interactive prediction charts using Recharts
- 🤖 Real-time model status monitoring
- 📈 Traffic flow visualization across 228 routes
- ⚡ Fast and lightweight using Vite

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Usage

1. Make sure the Flask backend is running on port 5000
2. Open `http://localhost:3000` in your browser
3. Click "Generate Predictions" to see traffic flow predictions

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Recharts** - Chart visualization
- **Axios** - HTTP client

## Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── Dashboard.tsx
│   │   ├── PredictionChart.tsx
│   │   └── ModelStatus.tsx
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## API Endpoints

The frontend communicates with the Flask backend at:
- `GET /api/model/info` - Get model information
- `POST /api/predict` - Generate predictions
- `GET /api/health` - Health check

## License

BSD 2-Clause License
