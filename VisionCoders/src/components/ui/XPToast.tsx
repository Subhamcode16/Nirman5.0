import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getXPActionDescription, XP_REWARDS } from '../../lib/xp-utils';

interface XPToastProps {
    xpAmount: number;
    action: keyof typeof XP_REWARDS;
    planetName?: string;
    onDismiss: () => void;
}

/**
 * XP Toast Notification
 * 
 * Shows a fun, toon-style notification when XP is gained.
 * Example: "+30 XP - Planet snacks on new knowledge crystals! 🪐"
 * 
 * Features:
 * - XP amount gained
 * - Toon description of the action
 * - Planet emoji/icon
 * - Auto-dismisses after 3 seconds
 */
export default function XPToast({ xpAmount, action, planetName, onDismiss }: XPToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const description = getXPActionDescription(action);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300); // Wait for exit animation
        }, 3000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    className="
                        fixed top-20 right-6 z-50
                        bg-gradient-to-r from-blue-600 to-purple-600
                        text-white rounded-xl shadow-2xl
                        px-5 py-3 max-w-sm
                        border-2 border-white/20
                    "
                >
                    <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-xl font-black text-yellow-300">
                                    +{xpAmount} XP
                                </span>
                                {planetName && (
                                    <span className="text-xs text-white/70 font-medium">
                                        {planetName}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-medium leading-tight">
                                {description} 🪐
                            </p>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onDismiss, 300);
                            }}
                            className="
                                flex-shrink-0 text-white/60 hover:text-white
                                transition-colors duration-200
                            "
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// =============================================
// XP Toast Container (manages multiple toasts)
// =============================================

interface XPToastData {
    id: string;
    xpAmount: number;
    action: keyof typeof XP_REWARDS;
    planetName?: string;
}

interface XPToastContainerProps {
    toasts: XPToastData[];
    onDismiss: (id: string) => void;
}

export function XPToastContainer({ toasts, onDismiss }: XPToastContainerProps) {
    return (
        <div className="fixed top-0 right-0 z-50 pointer-events-none">
            <div className="flex flex-col gap-3 p-6 pointer-events-auto">
                {toasts.map((toast, index) => (
                    <div
                        key={toast.id}
                        style={{
                            transform: `translateY(${index * 10}px)`,
                            transition: 'transform 0.3s ease',
                        }}
                    >
                        <XPToast
                            xpAmount={toast.xpAmount}
                            action={toast.action}
                            planetName={toast.planetName}
                            onDismiss={() => onDismiss(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
