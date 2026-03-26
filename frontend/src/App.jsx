import { useState, useCallback } from 'react';
import StockInput from './components/StockInput';
import StockChart from './components/StockChart';
import MetricsPanel from './components/MetricsPanel';
import { trainModel, getPredictions } from './api';
import ChatWidget from './components/Chatbot/ChatWidget';
import MarketDashboard from './components/MarketDashboard';
export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trainResult, setTrainResult] = useState(null);
  const [predictResult, setPredictResult] = useState(null);
  const [status, setStatus] = useState('');
  const [currentTickerInput, setCurrentTickerInput] = useState(null);

  const handleSubmit = useCallback(async ({ ticker, days, epochs }) => {
    setCurrentTickerInput(ticker);
    setLoading(true);
    setError(null);
    setTrainResult(null);
    setPredictResult(null);

    try {
      // Step 1: Train
      setStatus(`Training LSTM model for ${ticker}…`);
      const trainData = await trainModel(ticker, epochs);
      setTrainResult(trainData);

      // Step 2: Predict
      setStatus(`Generating ${days}-day predictions…`);
      const predData = await getPredictions(ticker, days);
      setPredictResult(predData);

      setStatus('');
    } catch (err) {
      const message =
        err.response?.data?.detail || err.message || 'Something went wrong';
      setError(message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!predictResult?.predictions) return;
    const csv = [
      'Date,Predicted Price',
      ...predictResult.predictions.map((p) => `${p.date},${p.price}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${predictResult.ticker}_predictions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [predictResult]);

  const themeClass = darkMode ? 'dark' : 'light';

  let currentTrend = 'sideways';
  if (predictResult?.predictions?.length) {
    const firstPrice = predictResult.historical?.[predictResult.historical.length - 1]?.price || predictResult.predictions[0].price;
    const lastPrice = predictResult.predictions[predictResult.predictions.length - 1].price;
    if (lastPrice > firstPrice * 1.01) currentTrend = 'bullish';
    else if (lastPrice < firstPrice * 0.99) currentTrend = 'bearish';
  }

  return (
    <div className={themeClass}>
      <div className={`min-h-screen transition-colors duration-500 ${darkMode
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
        }`}>
        {/* ── Decorative BG orbs ──────────────────────────────────────── */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-20 w-96 h-96 bg-accent-500/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-pink-500/8 rounded-full blur-3xl" />
        </div>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="relative z-10 border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className={`text-lg font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  NeuroTrade AI
                </h1>
                <p className={`text-[11px] font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  LSTM Neural Network Forecasting
                </p>
              </div>
            </div>

            {/* Dark mode toggle */}
            <button
              id="dark-mode-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${darkMode
                ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                : 'bg-gray-200/50 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              title="Toggle theme"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="relative z-10 text-center py-10 md:py-14 px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold gradient-text mb-3 leading-tight">
            Predict Stock Prices
          </h2>
          <p className={`text-base md:text-lg max-w-xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Powered by LSTM recurrent neural networks trained on historical market data.
            Enter any stock ticker to get started.
          </p>
        </section>

        {/* ── Main Content ────────────────────────────────────────────── */}
        <main className="relative z-10 max-w-6xl mx-auto px-4 pb-16">
          <MarketDashboard ticker={currentTickerInput} predictionTrend={currentTrend !== 'sideways' ? currentTrend : null} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input + Metrics */}
            <div className="lg:col-span-4 space-y-6">
              <StockInput onSubmit={handleSubmit} isLoading={loading} />

              {/* Status message */}
              {status && (
                <div className="glass-card p-4 animate-fade-in-up">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-400 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{status}</p>
                      <p className="text-xs text-gray-500">This may take a few minutes…</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 animate-shimmer" style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              {/* Metrics */}
              {trainResult && (
                <MetricsPanel
                  metrics={{
                    rmse: trainResult.rmse,
                    mae: trainResult.mae,
                    accuracy: trainResult.accuracy,
                  }}
                  trainingLoss={trainResult.training_loss}
                  onDownload={predictResult ? handleDownload : null}
                />
              )}
            </div>

            {/* Right: Charts */}
            <div className="lg:col-span-8 space-y-6">
              {/* Error */}
              {error && (
                <div className="glass-card p-5 border-red-500/30 animate-fade-in-up">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-400">Error</p>
                      <p className="text-sm text-gray-400 mt-0.5">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!trainResult && !loading && !error && (
                <div className="glass-card p-12 md:p-20 text-center animate-fade-in-up">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    No Predictions Yet
                  </h3>
                  <p className={`text-sm max-w-xs mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Select a stock ticker and hit <strong>Train & Predict</strong> to see the LSTM model
                    in action with interactive charts.
                  </p>
                </div>
              )}

              {/* Training chart */}
              {trainResult && <StockChart data={trainResult} type="training" />}

              {/* Prediction chart */}
              {predictResult && <StockChart data={predictResult} type="prediction" />}

              {/* Prediction summary table */}
              {predictResult?.predictions && (
                <div className="glass-card p-5 md:p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Prediction Summary
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className={`text-left py-2 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date</th>
                          <th className={`text-right py-2 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Predicted Price</th>
                          <th className={`text-right py-2 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictResult.predictions.map((row, i) => {
                          const prev = i === 0
                            ? predictResult.historical?.[predictResult.historical.length - 1]?.price
                            : predictResult.predictions[i - 1].price;
                          const change = prev ? ((row.price - prev) / prev * 100) : 0;
                          return (
                            <tr key={row.date} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                              <td className={`py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{row.date}</td>
                              <td className={`py-2 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                ${row.price.toFixed(2)}
                              </td>
                              <td className={`py-2 text-right font-semibold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <footer className={`relative z-10 border-t ${darkMode ? 'border-white/5' : 'border-gray-200'} py-6`}>
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              NeuroTrade AI — Powered by LSTM Neural Networks &amp; TensorFlow
            </p>
            <p className={`text-[10px] mt-1 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`}>
              Disclaimer: Predictions are for educational purposes only. Not financial advice.
            </p>
          </div>
        </footer>

        {/* ── Chatbot ─────────────────────────────────────────────────── */}
        <ChatWidget currentTicker={predictResult?.ticker} currentTrend={currentTrend} />
      </div>
    </div>
  );
}
