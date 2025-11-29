import clsx from 'clsx';
import { User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextGenerateEffect } from '../ui/text-generate-effect';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
    const isUser = role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={clsx(
                "flex gap-4 max-w-3xl mx-auto group",
                isUser ? "flex-row-reverse" : "flex-row"
            )}
        >
            <div className={clsx(
                "w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform group-hover:scale-110 duration-300",
                isUser
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
            )}>
                {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>

            <div className={clsx(
                "p-4 rounded-2xl shadow-sm border backdrop-blur-md transition-all duration-300 max-w-[80%] w-fit break-words",
                isUser
                    ? "bg-blue-600/80 dark:bg-blue-600/90 text-white rounded-tr-sm border-blue-500/30"
                    : "bg-white/60 dark:bg-white/5 text-gray-800 dark:text-gray-100 rounded-tl-sm border-white/20 dark:border-white/10"
            )}>
                {isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium tracking-wide opacity-95">
                        {content}
                    </p>
                ) : (
                    <TextGenerateEffect
                        words={content}
                        className="text-sm leading-relaxed whitespace-pre-wrap font-medium tracking-wide opacity-95"
                        duration={0.5}
                    />
                )}
            </div>
        </motion.div>
    );
}
