<<<<<<< HEAD
# 📈 NeuroTrade AI

> Stock price prediction web application powered by LSTM recurrent neural networks.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.16-orange)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4-purple)

## ✨ Features

- **Stock Search** — Enter any valid ticker (AAPL, TSLA, GOOGL, etc.)
- **LSTM Training** — 2-layer LSTM with dropout regularization
- **Future Predictions** — 7, 30, or 60-day price forecasts
- **Interactive Charts** — Gradient-filled area charts with hover tooltips
- **Evaluation Metrics** — RMSE, MAE, and directional accuracy
- **Training Progress** — Live loss curve visualization
- **Dark Mode** — Beautiful dark/light theme toggle
- **CSV Download** — Export predictions to CSV

## 🏗️ Tech Stack

| Layer    | Technology                               |
| -------- | ---------------------------------------- |
| Backend  | FastAPI, Python, TensorFlow/Keras        |
| AI Model | LSTM (128→64), Dropout, Dense            |
| Data     | yfinance, pandas, scikit-learn           |
| Frontend | React 19, Vite, Tailwind CSS 4, Recharts |

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **pip** and **npm**

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API server starts at `http://localhost:8000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:5173`.

## 📡 API Endpoints

| Method | Endpoint   | Description                | Body / Params          |
| ------ | ---------- | -------------------------- | ---------------------- |
| POST   | `/train`   | Train LSTM model           | `{ ticker, epochs }`   |
| GET    | `/predict` | Get future predictions     | `?ticker=AAPL&days=30` |
| GET    | `/health`  | Health check               | —                      |

## 🧠 Model Architecture

```
Input (60 timesteps × 1 feature)
  → LSTM (128 units, return_sequences=True)
  → Dropout (0.2)
  → LSTM (64 units)
  → Dropout (0.2)
  → Dense (32, ReLU)
  → Dense (1, Linear)
```

- **Optimizer**: Adam (lr=0.001)
- **Loss**: Mean Squared Error
- **Scaler**: MinMaxScaler (0–1)
- **Split**: 80% train / 20% test

## 📁 Project Structure

```
stock-rnn-app/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── model/
│   │   ├── rnn_model.py     # LSTM architecture
│   │   ├── train.py         # Training pipeline
│   │   └── predict.py       # Prediction module
│   ├── data/models/          # Saved models & scalers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main application
│   │   ├── api.js            # API service
│   │   ├── components/
│   │   │   ├── StockInput.jsx
│   │   │   ├── StockChart.jsx
│   │   │   └── MetricsPanel.jsx
│   │   └── index.css         # Design system
│   └── package.json
└── README.md
```

## ⚠️ Disclaimer

This application is for **educational purposes only**. Predictions should not be used as financial advice.
=======
# NeuroTrade-AI
Production-Ready AI Stock Price Prediction Web App built using LSTM/RNN, FastAPI, React, Alpha Vantage API, and AI Chatbot Assistant.  Features real-time market data, deep learning prediction, premium dashboard UI, and Gen-Z style AI trading assistant.
>>>>>>> edee11cd5e7a5b8553068d2da4efce94acb1cf7f
