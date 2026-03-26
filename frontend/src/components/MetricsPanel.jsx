export default function MetricsPanel({ metrics, trainingLoss, onDownload }) {
    if (!metrics) return null;

    const cards = [
        {
            label: 'RMSE',
            value: metrics.rmse?.toFixed(4),
            subtitle: 'Root Mean Square Error',
            color: 'from-primary-500 to-primary-600',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            label: 'MAE',
            value: metrics.mae?.toFixed(4),
            subtitle: 'Mean Absolute Error',
            color: 'from-accent-500 to-accent-600',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
            ),
        },
        {
            label: 'Accuracy',
            value: `${metrics.accuracy?.toFixed(1)}%`,
            subtitle: 'Directional Accuracy',
            color: metrics.accuracy >= 55 ? 'from-emerald-500 to-emerald-600' : 'from-amber-500 to-amber-600',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-3">
                {cards.map((card) => (
                    <div key={card.label} className="glass-card p-4 text-center group hover:scale-[1.02] transition-transform duration-200">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} text-white mb-2 shadow-lg`}>
                            {card.icon}
                        </div>
                        <p className="text-xl md:text-2xl font-extrabold text-white">{card.value}</p>
                        <p className="text-xs font-semibold text-gray-300 mt-0.5">{card.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{card.subtitle}</p>
                    </div>
                ))}
            </div>

            {/* Training loss mini-chart */}
            {trainingLoss && trainingLoss.length > 0 && (
                <div className="glass-card p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                        Training Loss Curve
                    </h4>
                    <div className="flex items-end gap-[2px] h-16">
                        {trainingLoss.map((loss, i) => {
                            const max = Math.max(...trainingLoss);
                            const height = max > 0 ? (loss / max) * 100 : 0;
                            return (
                                <div
                                    key={i}
                                    className="flex-1 rounded-t-sm bg-gradient-to-t from-primary-500/60 to-primary-400/30 hover:from-primary-400 hover:to-primary-300 transition-all duration-150"
                                    style={{ height: `${Math.max(height, 2)}%` }}
                                    title={`Epoch ${i + 1}: ${loss.toFixed(6)}`}
                                />
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                        <span>Epoch 1</span>
                        <span>Epoch {trainingLoss.length}</span>
                    </div>
                </div>
            )}

            {/* Download button */}
            {onDownload && (
                <button
                    id="download-btn"
                    onClick={onDownload}
                    className="w-full py-2.5 rounded-xl glass-card text-sm font-semibold text-gray-300
            hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Predictions (CSV)
                </button>
            )}
        </div>
    );
}
