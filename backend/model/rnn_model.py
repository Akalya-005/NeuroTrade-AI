"""
RNN (LSTM) Model for Stock Price Prediction
============================================
Two-layer LSTM with dropout regularization.
"""

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input


def build_model(sequence_length: int, n_features: int = 1) -> Sequential:
    """
    Build and return an LSTM model for time-series prediction.

    Architecture:
        Input → LSTM(128) → Dropout(0.2) → LSTM(64) → Dropout(0.2) → Dense(1)

    Args:
        sequence_length: Number of past time steps used as input.
        n_features: Number of features per time step (default 1 = closing price).

    Returns:
        Compiled Keras Sequential model.
    """
    model = Sequential([
        Input(shape=(sequence_length, n_features)),
        LSTM(128, return_sequences=True),
        Dropout(0.2),
        LSTM(64, return_sequences=False),
        Dropout(0.2),
        Dense(32, activation="relu"),
        Dense(1),
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss="mean_squared_error",
        metrics=["mae"],
    )

    return model
