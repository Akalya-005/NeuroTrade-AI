export default function ChatBubble({ message, isUser, isTyping }) {
    if (isTyping) {
        return (
            <div className="flex w-full mt-2 space-x-3 max-w-xs animate-fade-in-up">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="p-3 rounded-2xl rounded-tl-sm bg-white/10 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex w-full mt-2 space-x-3 max-w-xs animate-fade-in-up ${isUser ? 'ml-auto justify-end' : ''}`}>
            {!isUser && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center shadow-md">
                    <span className="text-white text-xs font-bold">AI</span>
                </div>
            )}
            <div>
                <div className={`p-3 rounded-2xl ${isUser
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-tr-sm'
                    : 'bg-white/10 text-gray-200 rounded-tl-sm border border-white/5'
                    }`}>
                    <p className="text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
}
