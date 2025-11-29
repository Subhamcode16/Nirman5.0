import { motion } from 'framer-motion';
import { Sparkles, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface LoginAnimationProps {
    onComplete?: () => void;
    username?: string;
    isNewUser?: boolean;
}

export default function LoginAnimation({ onComplete, username, isNewUser = false }: LoginAnimationProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            {/* Confetti particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: '50vw',
                        y: '50vh',
                        scale: 0,
                        rotate: 0,
                    }}
                    animate={{
                        x: `${Math.random() * 100}vw`,
                        y: `${Math.random() * 100}vh`,
                        scale: [0, 1, 0.8, 0],
                        rotate: Math.random() * 360,
                    }}
                    transition={{
                        duration: 2,
                        delay: Math.random() * 0.3,
                        ease: 'easeOut',
                    }}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                        backgroundColor: [
                            '#3B82F6',
                            '#8B5CF6',
                            '#EC4899',
                            '#F59E0B',
                            '#10B981',
                        ][i % 5],
                    }}
                />
            ))}

            {/* Center success message */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                }}
                className="relative z-10 bg-white rounded-2xl p-8 shadow-2xl"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <motion.div
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute inset-0 rounded-full bg-green-500"
                        />
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">
                            {isNewUser ? 'Welcome' : 'Welcome Back'}{username ? `, ${username}` : ''}!
                        </h2>
                        <p className="text-gray-500 flex items-center gap-2 justify-center">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            Login successful
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
