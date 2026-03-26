import { useState } from 'react';

const POPULAR_TICKERS = [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'GOOGL', name: 'Alphabet' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'META', name: 'Meta' },
    { symbol: 'INFY', name: 'Infosys' },
];

export default function StockInput({ onSubmit, isLoading }) {
    const [ticker, setTicker] = useState('');
    const [days, setDays] = useState(30);
    const [epochs, setEpochs] = useState(50);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!ticker.trim()) return;
        onSubmit({ ticker: ticker.trim().toUpperCase(), days, epochs });
    };

    const handleQuickSelect = (symbol) => {
        setTicker(symbol);
    };

    return (
        <div className="glass-card p-6 md:p-8 animate-fade-in-up">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Stock
                </h2>
                <p className="text-sm text-gray-400">Enter a ticker symbol or select from popular stocks</p>
            </div>

            {/* Quick-select chips */}
            <div className="flex flex-wrap gap-2 mb-5">
                {POPULAR_TICKERS.map(({ symbol, name }) => (
                    <button
                        key={symbol}
                        id={`quick-select-${symbol}`}
                        type="button"
                        onClick={() => handleQuickSelect(symbol)}
                        disabled={isLoading}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer
              ${ticker === symbol
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                            }
              disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                        {symbol}
                        <span className="ml-1 opacity-60 font-normal">{name}</span>
                    </button>
                ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Ticker input */}
                <div>
                    <label htmlFor="ticker-input" className="block text-sm font-medium text-gray-300 mb-2">
                        Ticker Symbol
                    </label>
                    <input
                        id="ticker-input"
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        placeholder="e.g. AAPL, TSLA, INFY"
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white
              placeholder-gray-500 text-lg font-semibold tracking-wide
              focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
              transition-all duration-200 disabled:opacity-40"
                    />
                </div>

                {/* Options row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Prediction horizon */}
                    <div>
                        <label htmlFor="days-select" className="block text-sm font-medium text-gray-300 mb-2">
                            Prediction Horizon
                        </label>
                        <div className="flex gap-2">
                            {[7, 30, 60].map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    id={`days-${d}`}
                                    onClick={() => setDays(d)}
                                    disabled={isLoading}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer
                    ${days === d
                                            ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                        }
                    disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Epochs */}
                    <div>
                        <label htmlFor="epochs-input" className="block text-sm font-medium text-gray-300 mb-2">
                            Training Epochs
                        </label>
                        <input
                            id="epochs-input"
                            type="number"
                            min={5}
                            max={200}
                            value={epochs}
                            onChange={(e) => setEpochs(Number(e.target.value))}
                            disabled={isLoading}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white
                text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/50
                transition-all duration-200 disabled:opacity-40"
                        />
                    </div>
                </div>

                {/* Submit button */}
                <button
                    id="train-predict-btn"
                    type="submit"
                    disabled={!ticker.trim() || isLoading}
                    className={`w-full py-3.5 rounded-xl text-white font-bold text-base tracking-wide
            transition-all duration-300 cursor-pointer
            ${isLoading
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-primary-500 via-accent-500 to-pink-500 hover:shadow-xl hover:shadow-primary-500/25 hover:scale-[1.01] active:scale-[0.99]'
                        }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-3">
                            <svg className="w-5 h-5 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Training LSTM Model…
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Train &amp; Predict
                        </span>
                    )}
                </button>
            </form>
        </div>
    );
}
