import { useState, useEffect } from 'react';
import { getCurrentMarket } from '../api';

export default function MarketDashboard({ ticker, predictionTrend }) {
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        if (!ticker) return;

        let isMounted = true;

        const fetchMarket = async () => {
            try {
                setLoading(true);
                const data = await getCurrentMarket(ticker);
                if (isMounted) {
                    setMarketData(data);
                    setLastUpdated(new Date().toLocaleTimeString());
                }
            } catch (err) {
                console.error("Failed to fetch market data:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMarket();

        // Auto refresh every 30 seconds
        const intervalId = setInterval(fetchMarket, 30000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [ticker]);

    if (!ticker) return null;

    return (
        <div className="glass-card mb-6 overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-3 px-5 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Real-Time Market Data
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                    {loading ? (
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></span> Updating...</span>
                    ) : (
                        <span>Last updated: {lastUpdated}</span>
                    )}
                </div>
            </div>

            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Stock & Source */}
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Stock</span>
                    <div className="flex items-end gap-2 text-white">
                        <span className="text-2xl font-black">{ticker}</span>
                    </div>
                    {marketData && (
                        <span className="text-[10px] text-gray-500 mt-1">Source: {marketData.source}</span>
                    )}
                </div>

                {/* Current Price */}
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Current Price</span>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-white">
                            ${marketData?.price ? marketData.price.toFixed(2) : '---'}
                        </span>
                    </div>
                </div>

                {/* Change */}
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">24h Change</span>
                    {marketData ? (
                        <div className={`flex items-center gap-1 text-lg font-bold ${marketData.change >= 0 ? 'text-emerald-400' : 'text-danger-400'
                            }`}>
                            {marketData.change >= 0 ? '+' : ''}{marketData.change} ({marketData.change_percent})
                        </div>
                    ) : (
                        <span className="text-lg text-gray-600 font-bold">---</span>
                    )}
                </div>

                {/* Market Trend & Prediction Trend combined */}
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Status</span>
                    <div className="flex flex-col gap-1 mt-0.5">
                        {marketData && (
                            <div className="flex items-center gap-1 text-sm font-semibold">
                                <span className="text-gray-300">Market:</span>
                                <span className={`${marketData.trend === 'bullish' ? 'text-emerald-400' : marketData.trend === 'bearish' ? 'text-danger-400' : 'text-gray-400'}`}>
                                    {marketData.trend === 'bullish' ? 'Bullish 📈' : marketData.trend === 'bearish' ? 'Bearish 📉' : 'Sideways 🦀'}
                                </span>
                            </div>
                        )}
                        {predictionTrend && (
                            <div className="flex items-center gap-1 text-sm font-semibold">
                                <span className="text-gray-300">Prediction:</span>
                                <span className={`${predictionTrend === 'bullish' ? 'text-emerald-400' : predictionTrend === 'bearish' ? 'text-danger-400' : 'text-gray-400'}`}>
                                    {predictionTrend === 'bullish' ? 'Uptrend 🚀' : predictionTrend === 'bearish' ? 'Downtrend 🔻' : 'Sideways 😴'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
