import requests
import yfinance as yf

# Alpha Vantage API Config
API_KEY = "2QZ9FAMAV2Y306M8"

def get_current_market_data(ticker: str) -> dict:
    """
    Fetch real-time stock data from Alpha Vantage API.
    Since the free tier limits to 25 requests/day, it gracefully falls back
    to yfinance if the rate-limit is exceeded (useful for 30s polling).
    """
    ticker = ticker.upper().strip()
    
    # 1. Primary: Alpha Vantage
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={API_KEY}"
    try:
        res = requests.get(url, timeout=5)
        data = res.json()
        
        if "Global Quote" in data and data["Global Quote"]:
            quote = data["Global Quote"]
            price = float(quote.get("05. price", 0))
            change = float(quote.get("09. change", 0))
            change_percent = quote.get("10. change percent", "0%").replace('%', '')
            volume = int(quote.get("06. volume", 0))
            
            trend = "bullish" if change > 0 else ("bearish" if change < 0 else "sideways")
            
            return {
                "ticker": ticker,
                "price": round(price, 2),
                "change": round(change, 2),
                "change_percent": f"{round(float(change_percent), 2)}%",
                "volume": volume,
                "trend": trend,
                "source": "Alpha Vantage"
            }
    except Exception:
        pass  # Fallthrough to yfinance
        
    # 2. Fallback: yfinance
    try:
        stock = yf.Ticker(ticker)
        # fastest path to get current price data
        fast_data = stock.fast_info
        price = fast_data.last_price
        prev_close = fast_data.previous_close
        change = price - prev_close
        change_percent = (change / prev_close) * 100
        volume = fast_data.last_volume

        trend = "bullish" if change > 0 else ("bearish" if change < 0 else "sideways")
        
        return {
            "ticker": ticker,
            "price": round(price, 2),
            "change": round(change, 2),
            "change_percent": f"{round(change_percent, 2)}%",
            "volume": int(volume) if volume else 0,
            "trend": trend,
            "source": "yfinance API"
        }
    except Exception as e:
        return {
            "ticker": ticker,
            "price": 0.0,
            "change": 0.0,
            "change_percent": "0.0%",
            "volume": 0,
            "trend": "sideways",
            "source": "error"
        }
