import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 600000, // 10 min — training can be slow
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Train an LSTM model for the given stock ticker.
 * POST /train
 */
export async function trainModel(ticker, epochs = 50, seqLength = 60) {
    const { data } = await api.post('/train', {
        ticker: ticker.toUpperCase().trim(),
        epochs,
        seq_length: seqLength,
    });
    return data;
}

/**
 * Get future price predictions for a trained ticker.
 * GET /predict?ticker=AAPL&days=30
 */
export async function getPredictions(ticker, days = 30) {
    const { data } = await api.get('/predict', {
        params: { ticker: ticker.toUpperCase().trim(), days },
    });
    return data;
}

/**
 * Chat with Sundaram AI
 * POST /chat
 */
export async function chatWithAI(message, ticker, trend) {
    const { data } = await api.post('/chat', {
        message,
        ticker,
        trend,
    });
    return data;
}

/**
 * Get real-time market data directly from Alpha Vantage or yfinance.
 * GET /market/current?ticker=AAPL
 */
export async function getCurrentMarket(ticker) {
    const { data } = await api.get('/market/current', {
        params: { ticker: ticker.toUpperCase().trim() },
    });
    return data;
}

export default api;
