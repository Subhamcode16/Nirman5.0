import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Mail, Hash, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        // Wait for logout animation to complete
        setTimeout(() => navigate('/login'), 2000);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600">Please log in to view your profile.</p>
            </div>
        );
    }

    const userName = user.user_metadata?.name || 'User';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold mb-8 text-gray-800">User Dashboard</h1>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {/* Profile Header */}
                        <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <User className="w-10 h-10 text-white" />
                            </motion.div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{userName}</h2>
                                <p className="text-gray-500 text-sm mt-1">Welcome to your dashboard</p>
                            </div>
                        </div>

                        {/* User Information */}
                        <div className="space-y-4 mb-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Account Information</h3>

                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                <UserCircle className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                                    <p className="text-gray-800 font-medium">{userName}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                <Mail className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                    <p className="text-gray-800 font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                <Hash className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">User ID</p>
                                    <p className="text-gray-800 font-mono text-sm">{user.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
