import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { AIInputWithSuggestions } from './AIInputWithSuggestions';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface ActionItem {
    text: string;
    icon: any;
    colors: {
        icon: string;
        border: string;
        bg: string;
    };
}

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (text: string, action?: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    actions?: ActionItem[];
    className?: string;
}

export default function ChatInterface({
    messages,
    onSendMessage,
    isLoading = false,
    placeholder = "Type a message...",
    actions,
    className
}: ChatInterfaceProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center h-full text-gray-400"
                        >
                            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                                <Sparkles className="w-8 h-8 text-blue-500/50" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                How can I help you today?
                            </h3>
                            <p className="text-sm text-gray-500 max-w-xs text-center leading-relaxed">
                                Ask me anything about your documents or select an action below to get started.
                            </p>
                        </motion.div>
                    ) : (
                        messages.map((msg) => (
                            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                        ))
                    )}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex justify-start max-w-3xl mx-auto pl-14"
                    >
                        <div className="bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm backdrop-blur-sm flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-500 font-medium">Thinking...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-6 pb-6 pt-4">
                <AIInputWithSuggestions
                    onSubmit={onSendMessage}
                    actions={actions}
                    placeholder={placeholder}
                    className="py-0"
                />
            </div>
        </div>
    );
}
