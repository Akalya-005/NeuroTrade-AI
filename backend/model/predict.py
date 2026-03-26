"""
Prediction Module
=================
Loads a saved LSTM model and generates future stock price predictions
using a rolling-window approach.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from datetime import datetime, timedelta
from tensorflow.keras.models import load_model

from model.train import fetch_stock_data

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(DATA_DIR, "models")


def _load_artifacts(ticker: str):
    """Load saved model, scaler, and metadata for a ticker."""
    ticker = ticker.upper().strip()
    model_path = os.path.join(MODELS_DIR, f"{ticker}_model.keras")
    scaler_path = os.path.join(MODELS_DIR, f"{ticker}_scaler.pkl")
    meta_path = os.path.join(MODELS_DIR, f"{ticker}_meta.json")

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"No trained model found for '{ticker}'. Train the model first."
        )

    model = load_model(model_path)
    scaler = joblib.load(scaler_path)
    with open(meta_path) as f:
        meta = json.load(f)

    return model, scaler, meta


def predict_future(ticker: str, days: int = 30) -> dict:
    """
    Predict future stock prices for the given number of days.

    Process:
        1. Load trained model & scaler
        2. Fetch recent data (enough for one sequence)
        3. Iteratively predict next day using rolling window
        4. Inverse-transform predictions to real prices

    Args:
        ticker: Stock ticker symbol.
        days: Number of future days to predict (7 or 30).

    Returns:
        Dict with predictions list, future dates, metrics, and historical data.
    """
    model, scaler, meta = _load_artifacts(ticker)
    seq_length = meta["seq_length"]

    # Fetch recent data
    df = fetch_stock_data(ticker, period="2y")
    close_prices = df["Close"].values.reshape(-1, 1)
    scaled = scaler.transform(close_prices)

    # Take the last `seq_length` data points as seed
    seed = scaled[-seq_length:].flatten().tolist()

    predictions_scaled = []
    for _ in range(days):
        input_seq = np.array(seed[-seq_length:]).reshape(1, seq_length, 1)
        pred = model.predict(input_seq, verbose=0)[0, 0]
        predictions_scaled.append(pred)
        seed.append(pred)

    # Inverse transform
    predictions = scaler.inverse_transform(
        np.array(predictions_scaled).reshape(-1, 1)
    ).flatten()

    # Generate future dates (skip weekends)
    last_date = pd.Timestamp(df["Date"].iloc[-1])
    future_dates = []
    current = last_date
    while len(future_dates) < days:
        current += timedelta(days=1)
        if current.weekday() < 5:  # Mon-Fri
            future_dates.append(current.strftime("%Y-%m-%d"))

    # Recent historical for chart context (last 90 trading days)
    recent = df.tail(90)
    historical = [
        {"date": str(row["Date"])[:10], "price": round(float(row["Close"]), 2)}
        for _, row in recent.iterrows()
    ]

    predicted = [
        {"date": d, "price": round(float(p), 2)}
        for d, p in zip(future_dates, predictions)
    ]

    return {
        "ticker": ticker.upper(),
        "days": days,
        "predictions": predicted,
        "historical": historical,
        "metrics": {
            "rmse": meta["rmse"],
            "mae": meta["mae"],
            "accuracy": meta["accuracy"],
            "trained_at": meta["trained_at"],
        },
    }
