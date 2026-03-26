import { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() || disabled) return;
        onSend(text.trim());
        setText('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-black/20">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full pr-1.5 pl-4 py-1">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={disabled}
                    placeholder={disabled ? "Sundaram AI is typing..." : "Message Sundaram AI..."}
                    className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500 py-2 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={disabled || !text.trim()}
                    className="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </form>
    );
}
