"""
Training Pipeline
=================
Fetches stock data, preprocesses it, trains the LSTM model, and saves
the trained model + scaler to disk.
"""

import os
import json
import numpy as np
import pandas as pd
import yfinance as yf
import joblib
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error

from model.rnn_model import build_model

# ── paths ────────────────────────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(DATA_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)


# ── data fetching ────────────────────────────────────────────────────────
def fetch_stock_data(ticker: str, period: str = "5y") -> pd.DataFrame:
    """Download historical stock data from Yahoo Finance."""
    df = yf.download(ticker, period=period, progress=False)
    if df.empty:
        raise ValueError(f"No data found for ticker '{ticker}'")
    # Flatten multi-level columns if present
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df = df[["Close"]].dropna()
    df.reset_index(inplace=True)
    return df


# ── preprocessing ────────────────────────────────────────────────────────
def preprocess_data(
    df: pd.DataFrame, seq_length: int = 60
) -> tuple:
    """
    Scale data and create sliding-window sequences.

    Returns:
        X_train, y_train, X_test, y_test, scaler, dates
    """
    close_prices = df["Close"].values.reshape(-1, 1)
    dates = df["Date"].values

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(close_prices)

    X, y = [], []
    for i in range(seq_length, len(scaled)):
        X.append(scaled[i - seq_length : i, 0])
        y.append(scaled[i, 0])
    X, y = np.array(X), np.array(y)

    # reshape for LSTM [samples, timesteps, features]
    X = X.reshape(X.shape[0], X.shape[1], 1)

    # 80 / 20 split
    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    train_dates = dates[seq_length : seq_length + split]
    test_dates = dates[seq_length + split :]

    return X_train, y_train, X_test, y_test, scaler, train_dates, test_dates


# ── training ─────────────────────────────────────────────────────────────
def train_model(
    ticker: str,
    epochs: int = 50,
    batch_size: int = 32,
    seq_length: int = 60,
) -> dict:
    """
    Full training pipeline.
    Returns dict with metrics + file paths.
    """
    ticker = ticker.upper().strip()

    # 1. Fetch data
    df = fetch_stock_data(ticker)

    # 2. Preprocess
    X_train, y_train, X_test, y_test, scaler, train_dates, test_dates = (
        preprocess_data(df, seq_length)
    )

    # 3. Build model
    model = build_model(sequence_length=seq_length)

    # 4. Train
    history = model.fit(
        X_train,
        y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.1,
        verbose=1,
    )

    # 5. Evaluate on test set
    y_pred_scaled = model.predict(X_test, verbose=0)
    # inverse-transform to get real prices
    y_pred = scaler.inverse_transform(y_pred_scaled).flatten()
    y_true = scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()

    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mae = float(mean_absolute_error(y_true, y_pred))

    # directional accuracy
    if len(y_true) > 1:
        true_dir = np.diff(y_true) > 0
        pred_dir = np.diff(y_pred) > 0
        accuracy = float(np.mean(true_dir == pred_dir) * 100)
    else:
        accuracy = 0.0

    # 6. Save model + scaler
    model_path = os.path.join(MODELS_DIR, f"{ticker}_model.keras")
    scaler_path = os.path.join(MODELS_DIR, f"{ticker}_scaler.pkl")
    meta_path = os.path.join(MODELS_DIR, f"{ticker}_meta.json")

    model.save(model_path)
    joblib.dump(scaler, scaler_path)

    meta = {
        "ticker": ticker,
        "seq_length": seq_length,
        "epochs": epochs,
        "rmse": round(rmse, 4),
        "mae": round(mae, 4),
        "accuracy": round(accuracy, 2),
        "trained_at": datetime.now().isoformat(),
        "data_points": len(df),
    }
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    # Build test results for charting
    test_actual = [
        {"date": str(d)[:10], "price": round(float(p), 2)}
        for d, p in zip(test_dates, y_true)
    ]
    test_predicted = [
        {"date": str(d)[:10], "price": round(float(p), 2)}
        for d, p in zip(test_dates, y_pred)
    ]

    # historical data for chart
    historical = [
        {"date": str(row["Date"])[:10], "price": round(float(row["Close"]), 2)}
        for _, row in df.iterrows()
    ]

    return {
        "ticker": ticker,
        "rmse": round(rmse, 4),
        "mae": round(mae, 4),
        "accuracy": round(accuracy, 2),
        "epochs": epochs,
        "data_points": len(df),
        "historical": historical,
        "test_actual": test_actual,
        "test_predicted": test_predicted,
        "training_loss": [round(float(v), 6) for v in history.history["loss"]],
    }
