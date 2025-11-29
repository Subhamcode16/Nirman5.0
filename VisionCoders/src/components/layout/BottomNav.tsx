import { Home, Plus, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import clsx from 'clsx';

export default function BottomNav() {
    const location = useLocation();
    const { setUploadModalOpen } = useChatStore();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center md:hidden z-40">
            <Link to="/" className={clsx("flex flex-col items-center gap-1", isActive('/') ? "text-blue-600" : "text-gray-400")}>
                <Home className="w-6 h-6" />
                <span className="text-[10px] font-medium">Home</span>
            </Link>

            <button
                onClick={() => setUploadModalOpen(true)}
                className="flex flex-col items-center gap-1 text-blue-600 -mt-8"
            >
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <Plus className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] font-medium">New Bot</span>
            </button>

            <Link to="/profile" className={clsx("flex flex-col items-center gap-1", isActive('/profile') ? "text-blue-600" : "text-gray-400")}>
                <User className="w-6 h-6" />
                <span className="text-[10px] font-medium">Profile</span>
            </Link>
        </div>
    );
}
