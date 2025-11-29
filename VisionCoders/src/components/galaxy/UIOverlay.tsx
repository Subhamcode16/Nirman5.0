import { LogIn, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';

interface UIOverlayProps {
    user: any;
}

export default function UIOverlay({ user }: UIOverlayProps) {
    const { toggleSidebar } = useChatStore();

    return (
        <>
            {/* Sign In Button (top-right) */}
            {!user && (
                <motion.div
                    className="absolute top-6 right-6 z-50"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Link
                        to="/login"
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/15 backdrop-blur-md border border-blue-500/30 rounded-xl text-blue-400 font-medium hover:bg-blue-500/25 hover:border-blue-500/50 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
                    >
                        <LogIn className="w-4 h-4" />
                        Sign In
                    </Link>
                </motion.div>
            )}

            {/* Sidebar Toggle Button (Hamburger) */}
            <motion.div
                className="absolute left-6 top-6 z-50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
            >
                <button
                    onClick={toggleSidebar}
                    className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </motion.div>

            {/* Control Hints (bottom-center) */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 text-center"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 5, duration: 1 }}
            >
                <p className="text-white/60 text-sm">
                    Drag to rotate • Scroll to zoom • Click planet to chat
                </p>
            </motion.div>
        </>
    );
}
