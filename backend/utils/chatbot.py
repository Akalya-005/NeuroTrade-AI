import random

def generate_genz_response(message: str, ticker: str = None, trend: str = None) -> str:
    """
    Generate a Gen-Z style conversational response based on simple rules
    and keyword matching, incorporating stock ticker and real-time trend.
    """
    msg = message.lower()
    ticker_str = ticker.upper() if ticker else "The market"
    
    # Optional: fetch real-time data to inject into conversation
    real_time = {}
    if ticker:
        from api.market import get_current_market_data
        real_time = get_current_market_data(ticker)

    # If no trend given in args, use the real-time trend
    current_trend = trend.lower() if trend and trend != 'sideways' else real_time.get("trend", "sideways")
    rt_price = real_time.get("price")

    # 1. Greetings
    if msg in ["hi", "hello", "yo", "sup", "hey"]:
        base = f"Yo! 👋 Sundaram AI here. Ask me about {ticker_str} or if you should ape in! 🚀"
        if rt_price:
            base += f" Btw, {ticker_str} is currently sitting at ${rt_price} 🔥"
        return base

    # 2. Buying / Investing Advice
    if any(word in msg for word in ["buy", "invest", "entry", "hold", "sell"]):
        if current_trend == "bullish":
            res = f"📈 {ticker_str} is looking bullish rn 👀 Prediction shows upward momentum. "
            if rt_price:
                res += f"Sitting pretty at ${rt_price}. "
            res += "Could be a decent entry 🚀 No cap."
            return res
        elif current_trend == "bearish":
            return f"😬 {ticker_str} looking down bad rn. I'd wait for the dip, kinda risky to catch this falling knife 🔪"
        else:
            return f"Market vibes = sideways rn 😴 Maybe wait for a breakout before aping into {ticker_str}."

    # 3. Market Trend / Status
    if any(word in msg for word in ["bullish", "bearish", "trend", "status", "whats up"]):
        if current_trend == "bullish":
            return f"{ticker_str} is definitely giving bull vibes 🔥 Up only from here? (NFA tho 💀)"
        elif current_trend == "bearish":
            return f"Yikes, {ticker_str} is taking a fat L recently 📉 Big bearish energy."
        else:
            return f"It's just crabbing sideways 🦀 Not much action on {ticker_str} atm."

    # 4. Default / Fallback Responses
    fallbacks = [
        f"Bro I'm just an AI 🤖 but {ticker_str} is definitely doing things. Check the charts! 📊",
        f"TL;DR on {ticker_str}: Do your own research, but the vibes are immaculate ✨",
        f"Idk man, {ticker_str} is wilding right now. What does the LSTM chart say? 🧠",
        f"Facts: the market is unpredictable. But {ticker_str} might be cooking something 🔥",
        f"Sir, this is a Wendy's... jk 😂 But fr keep an eye on {ticker_str} volume 👀"
    ]
    
    return random.choice(fallbacks)
