import { motion } from 'framer-motion';
import { LogOut, Heart } from 'lucide-react';
import { useEffect } from 'react';

interface LogoutAnimationProps {
    onComplete?: () => void;
}

export default function LogoutAnimation({ onComplete }: LogoutAnimationProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm"
        >
            {/* Floating hearts */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: '50vw',
                        y: '100vh',
                        scale: 0,
                        opacity: 0,
                    }}
                    animate={{
                        x: `${30 + Math.random() * 40}vw`,
                        y: '-10vh',
                        scale: [0, 1, 0.8],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 2,
                        delay: i * 0.1,
                        ease: 'easeOut',
                    }}
                    className="absolute"
                >
                    <Heart
                        className="w-6 h-6 text-pink-400"
                        fill="currentColor"
                    />
                </motion.div>
            ))}

            {/* Center goodbye message */}
            <motion.div
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                }}
                className="relative z-10 bg-white rounded-2xl p-8 shadow-2xl"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-4"
                >
                    <motion.div
                        animate={{
                            rotate: [0, 15, -15, 15, 0],
                        }}
                        transition={{
                            duration: 1,
                            repeat: 1,
                            ease: 'easeInOut',
                        }}
                        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                    >
                        <LogOut className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">
                            See You Soon!
                        </h2>
                        <p className="text-gray-500">
                            You've been logged out successfully
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Wave effect */}
            <motion.div
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
            </motion.div>
        </motion.div>
    );
}
