"""
FastAPI Backend — NeuroTrade AI
====================================
API server with endpoints for training LSTM models and generating
stock price predictions.
"""

import traceback
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from model.train import train_model
from model.predict import predict_future

# ── App setup ────────────────────────────────────────────────────────────
app = FastAPI(
    title="NeuroTrade AI API",
    description="Stock price prediction using LSTM neural networks",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response schemas ───────────────────────────────────────────
class TrainRequest(BaseModel):
    ticker: str = Field(..., description="Stock ticker symbol, e.g. AAPL")
    epochs: int = Field(default=50, ge=5, le=200, description="Training epochs")
    seq_length: int = Field(default=60, ge=10, le=120, description="Sequence length")


class TrainResponse(BaseModel):
    ticker: str
    rmse: float
    mae: float
    accuracy: float
    epochs: int
    data_points: int
    historical: list
    test_actual: list
    test_predicted: list
    training_loss: list


class PredictionItem(BaseModel):
    date: str
    price: float


class MetricsResponse(BaseModel):
    rmse: float
    mae: float
    accuracy: float
    trained_at: str


class PredictResponse(BaseModel):
    ticker: str
    days: int
    predictions: list
    historical: list
    metrics: MetricsResponse


class ChatRequest(BaseModel):
    message: str = Field(..., description="User chat message")
    ticker: str = Field(default="AAPL", description="Current stock context")
    trend: str = Field(default="sideways", description="Calculated trend (bullish/bearish/sideways)")


class ChatResponse(BaseModel):
    response: str


class MarketResponse(BaseModel):
    ticker: str
    price: float
    change: float
    change_percent: str
    volume: int
    trend: str
    source: str


# ── Endpoints ────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "NeuroTrade AI API",
        "version": "1.0.0",
        "endpoints": {
            "POST /train": "Train an LSTM model for a stock ticker",
            "GET /predict": "Get future price predictions",
            "POST /chat": "Gen-Z Stock AI Assistant",
            "GET /market/current": "Get real-time market data",
            "GET /health": "Health check",
        },
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/market/current", response_model=MarketResponse)
def api_market_current(ticker: str = Query(..., description="Stock ticker symbol")):
    """
    Get real-time market data from Alpha Vantage (with yfinance fallback).
    """
    from api.market import get_current_market_data
    return get_current_market_data(ticker)


@app.post("/chat", response_model=ChatResponse)
def api_chat(req: ChatRequest):
    """
    Handle chat queries with Sundaram AI in Gen-Z tone.
    """
    # Import the chatbot logic here to avoid circular dependencies
    from utils.chatbot import generate_genz_response
    
    try:
        reply = generate_genz_response(
            message=req.message,
            ticker=req.ticker,
            trend=req.trend
        )
        return {"response": reply}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.post("/train", response_model=TrainResponse)
def api_train(req: TrainRequest):
    """
    Train an LSTM model on historical stock data.
    This may take 1-5 minutes depending on data size and epochs.
    """
    try:
        result = train_model(
            ticker=req.ticker,
            epochs=req.epochs,
            seq_length=req.seq_length,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@app.get("/predict", response_model=PredictResponse)
def api_predict(
    ticker: str = Query(..., description="Stock ticker symbol"),
    days: int = Query(default=30, ge=1, le=90, description="Days to predict"),
):
    """
    Generate future stock price predictions using a trained model.
    The model must be trained first via POST /train.
    """
    try:
        result = predict_future(ticker=ticker, days=days)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
