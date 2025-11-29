import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, FileText, Zap, Text, Sun, Moon, Settings } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import ChatInterface from '../chat/ChatInterface';
import BotSettingsModal from '../bot/BotSettingsModal';
import { useState } from 'react';
import clsx from 'clsx';
import type { ChatBot } from '../../types/galaxy';

interface ChatModalProps {
    bot: ChatBot;
    planetColor: string;
    onClose: () => void;
}

export default function ChatModal({ bot, planetColor, onClose }: ChatModalProps) {
    const { messages, sendMessage } = useChatStore();
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleSend = async (text: string, action?: string) => {
        if (!user) return;

        const content = action ? `[${action}] ${text}` : text;
        setIsLoading(true);

        try {
            await sendMessage(content, bot.id, user.id);
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const actions = [
        {
            text: "Summary",
            icon: Text,
            colors: {
                icon: "text-orange-600",
                border: "border-orange-500",
                bg: "bg-orange-100",
            },
        },
        {
            text: "Quiz me",
            icon: Zap,
            colors: {
                icon: "text-yellow-600",
                border: "border-yellow-500",
                bg: "bg-yellow-100",
            },
        },
        {
            text: "Short notes",
            icon: FileText,
            colors: {
                icon: "text-blue-600",
                border: "border-blue-500",
                bg: "bg-blue-100",
            },
        },
        {
            text: "Explain",
            icon: Sparkles,
            colors: {
                icon: "text-purple-600",
                border: "border-purple-500",
                bg: "bg-purple-100",
            },
        },
    ];

    return (
        <AnimatePresence>
            <div className={clsx("relative z-50", isDark && "dark")}>
                <motion.div
                    className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop blur */}
                    <div
                        className="absolute inset-0 backdrop-blur-md bg-black/40 transition-all duration-300"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        className="relative w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-300 bg-white dark:bg-[#0a0a0f]"
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Inner Container for Background */}
                        <div className="absolute inset-0 bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-xl transition-colors duration-300" />

                        {/* Header */}
                        <div className="relative flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 backdrop-blur-md z-10 transition-colors duration-300">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-black/5 dark:ring-white/10"
                                    style={{
                                        background: `linear-gradient(135deg, ${planetColor}, ${planetColor}88)`,
                                    }}
                                >
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">{bot.name}</h2>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Online
                                        </span>
                                        <span>•</span>
                                        <span>v1.0.0</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 transition-colors duration-300">
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>{bot.pdfCount} PDFs</span>
                                    </div>
                                    <div className="w-px h-3 bg-black/10 dark:bg-white/10" />
                                    <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-500">
                                        <Zap className="w-3.5 h-3.5" />
                                        <span>{bot.xp} XP</span>
                                    </div>
                                </div>

                                {/* Settings Button */}
                                <button
                                    onClick={() => setIsSettingsOpen(true)}
                                    className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center justify-center group"
                                    title="Bot Settings"
                                >
                                    <Settings className="w-4 h-4 text-gray-500 dark:text-white/70 group-hover:text-gray-700 dark:group-hover:text-white transition-colors" />
                                </button>

                                {/* Theme Toggle */}
                                <button
                                    onClick={() => setIsDark(!isDark)}
                                    className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center justify-center group"
                                >
                                    {isDark ? (
                                        <Sun className="w-4 h-4 text-yellow-400" />
                                    ) : (
                                        <Moon className="w-4 h-4 text-gray-600" />
                                    )}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center justify-center group"
                                >
                                    <X className="w-4 h-4 text-gray-500 dark:text-white/70 group-hover:text-gray-700 dark:group-hover:text-white transition-colors" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-transparent to-black/5 dark:to-black/20">
                            <ChatInterface
                                messages={messages}
                                onSendMessage={handleSend}
                                isLoading={isLoading}
                                placeholder={`Message ${bot.name}...`}
                                actions={actions}
                                className="h-full"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Bot Settings Modal */}
            {isSettingsOpen && (
                <BotSettingsModal
                    bot={bot}
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}
        </AnimatePresence>
    );
}
