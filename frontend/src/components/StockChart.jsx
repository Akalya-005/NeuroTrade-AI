import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area, AreaChart,
    Legend, ReferenceLine,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card px-4 py-3 text-sm !bg-gray-900/90 border-white/10">
            <p className="font-semibold text-white mb-1">{label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color }} className="flex justify-between gap-4">
                    <span className="opacity-70">{entry.name}:</span>
                    <span className="font-bold">${entry.value?.toFixed(2)}</span>
                </p>
            ))}
        </div>
    );
}

export default function StockChart({ data, type = 'training' }) {
    if (!data) return null;

    // ── Training results chart (actual vs predicted on test set)
    if (type === 'training') {
        const { test_actual = [], test_predicted = [], historical = [], ticker } = data;

        // Merge test actual + predicted for overlay
        const chartData = test_actual.map((item, i) => ({
            date: item.date,
            actual: item.price,
            predicted: test_predicted[i]?.price || null,
        }));

        return (
            <div className="glass-card p-5 md:p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Model Test Results — {ticker}
                </h3>
                <p className="text-sm text-gray-400 mb-4">Actual vs. Predicted prices on the test set</p>

                <ResponsiveContainer width="100%" height={360}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `$${v}`}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                            formatter={(value) => <span className="text-gray-300">{value}</span>}
                        />
                        <Area
                            type="monotone"
                            dataKey="actual"
                            name="Actual Price"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#gradActual)"
                            dot={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="predicted"
                            name="Predicted Price"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fill="url(#gradPredicted)"
                            dot={false}
                            strokeDasharray="6 3"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    }

    // ── Prediction chart (historical + future)
    if (type === 'prediction') {
        const { historical = [], predictions = [], ticker } = data;

        const lastHistorical = historical[historical.length - 1];
        const chartData = [
            ...historical.map((h) => ({ date: h.date, historical: h.price, prediction: null })),
            // Connect line: last historical point is also start of prediction
            { date: lastHistorical?.date, historical: lastHistorical?.price, prediction: lastHistorical?.price },
            ...predictions.map((p) => ({ date: p.date, historical: null, prediction: p.price })),
        ];

        const splitDate = lastHistorical?.date;

        return (
            <div className="glass-card p-5 md:p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Future Price Forecast — {ticker}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                    {predictions.length}-day prediction based on LSTM model
                </p>

                <ResponsiveContainer width="100%" height={360}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="gradHist" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradFuture" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `$${v}`}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                            formatter={(value) => <span className="text-gray-300">{value}</span>}
                        />
                        {splitDate && (
                            <ReferenceLine
                                x={splitDate}
                                stroke="rgba(255,255,255,0.2)"
                                strokeDasharray="4 4"
                                label={{ value: 'Today', fill: '#9ca3af', fontSize: 11 }}
                            />
                        )}
                        <Area
                            type="monotone"
                            dataKey="historical"
                            name="Historical"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#gradHist)"
                            dot={false}
                            connectNulls={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="prediction"
                            name="Predicted"
                            stroke="#f59e0b"
                            strokeWidth={2.5}
                            fill="url(#gradFuture)"
                            dot={false}
                            connectNulls={false}
                            strokeDasharray="6 3"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return null;
}
