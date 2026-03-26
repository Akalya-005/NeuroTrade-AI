import { useState, useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { chatWithAI } from '../../api';

export default function ChatWidget({ currentTicker, currentTrend }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Yo! 👋 Sundaram AI here. Need help analyzing a stock or want to know if it's hitting or missing? Just ask!",
            isUser: false,
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Track if we've already sent the smart trigger for this ticker
    const [triggeredTickers, setTriggeredTickers] = useState(new Set());

    // Smart Trigger: when currentTrend/currentTicker updates, pop open bubble and say hi
    useEffect(() => {
        if (currentTicker && currentTrend && !triggeredTickers.has(currentTicker)) {
            setTriggeredTickers(prev => new Set(prev).add(currentTicker));

            const emoji = currentTrend === 'bullish' ? '🚀' : currentTrend === 'bearish' ? '📉' : '😴';
            const trendMsg = currentTrend === 'bullish'
                ? "slightly bullish"
                : currentTrend === 'bearish'
                    ? "downward"
                    : "sideways";

            const autoMsg = {
                id: Date.now(),
                text: `👋 Yo! Just ran a prediction for ${currentTicker}. Looks ${trendMsg} over the next window ${emoji}. Wanna see details?`,
                isUser: false,
            };

            setMessages(prev => [...prev, autoMsg]);
            // Optional: Auto open on predict
            // setIsOpen(true);
        }
    }, [currentTicker, currentTrend, triggeredTickers]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleSend = async (text) => {
        // Add user message
        const userMsg = { id: Date.now(), text, isUser: true };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // Simulate slight network delay for effect
            await new Promise(resolve => setTimeout(resolve, 800));
            const res = await chatWithAI(text, currentTicker, currentTrend);

            const aiMsg = { id: Date.now() + 1, text: res.response, isUser: false };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            const errorMsg = { id: Date.now() + 1, text: "Oof, my servers took an L 😵‍💫 Try again?", isUser: false };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestion = (text) => {
        if (!isTyping) {
            handleSend(text);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[340px] max-w-[calc(100vw-32px)] h-[480px] max-h-[80vh] flex flex-col glass-card border border-white/10 shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up origin-bottom-right">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-pink-500 p-[2px] shadow-lg shadow-pink-500/20">
                                    <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                                        <span className="text-xl">🔥</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-900"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Sundaram AI</h3>
                                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Online</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-950/80 custom-scrollbar">
                        {messages.map((msg) => (
                            <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} />
                        ))}
                        {isTyping && <ChatBubble isTyping={true} />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {!isTyping && messages.length < 5 && (
                        <div className="flex gap-2 px-3 pb-3 overflow-x-auto custom-scrollbar bg-gray-950/80">
                            {['Should I invest now?', `Is ${currentTicker || 'the market'} bullish?`, 'What is market trend?'].map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSuggestion(suggestion)}
                                    className="flex-shrink-0 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 hover:bg-primary-500/20 text-xs text-primary-300 font-medium transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <ChatInput onSend={handleSend} disabled={isTyping} />
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center shadow-2xl shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all duration-300 ${isOpen ? 'w-12 h-12 bg-gray-800 rounded-full' : 'w-[140px] h-14 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full'
                    }`}
            >
                {isOpen ? (
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🔥</span>
                        <span className="text-white font-bold text-sm tracking-wide shadow-black/10 text-shadow-sm whitespace-nowrap px-1">Sundaram AI</span>
                    </div>
                )}
            </button>

        </div>
    );
}
