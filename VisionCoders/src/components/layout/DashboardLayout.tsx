import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import UploadModal from '../upload/UploadModal';
import { useChatStore } from '../../store/useChatStore';

export default function DashboardLayout() {
    const { isUploadModalOpen, setUploadModalOpen, isSidebarOpen } = useChatStore();

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {isSidebarOpen && (
                <div className="h-full flex-shrink-0">
                    <Sidebar />
                </div>
            )}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 pb-20 md:pb-0">
                <Outlet />
            </main>
            <BottomNav />
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
            />
        </div>
    );
}
