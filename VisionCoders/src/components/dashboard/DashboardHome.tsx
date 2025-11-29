import { useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import GalaxyScene from '../galaxy/GalaxyScene';
import UIOverlay from '../galaxy/UIOverlay';
import ChatModal from '../galaxy/ChatModal';

export default function DashboardHome() {
    const { chatbots, loadChatbots, initializeRealtime, isLoadingChatbots, selectedBotId, setSelectedBot } = useChatStore();
    const { user } = useAuthStore();

    // Load chatbots from database and initialize real-time subscriptions
    useEffect(() => {
        if (user) {
            // Load existing chatbots
            loadChatbots();

            // Initialize real-time subscriptions
            const cleanup = initializeRealtime();

            // Cleanup on unmount
            return cleanup;
        }
    }, [user, loadChatbots, initializeRealtime]);

    const handlePlanetClick = (botId: string) => {
        setSelectedBot(botId);
    };

    const handleCloseModal = () => {
        setSelectedBot(null);
    };

    const selectedBot = chatbots.find((bot) => bot.id === selectedBotId);

    const getPlanetColor = (textureType: string) => {
        const colors: Record<string, string> = {
            rocky: '#8b7355',
            icy: '#a8d8ea',
            desert: '#d4a574',
            ocean: '#2e5090',
            volcanic: '#d64545',
        };
        return colors[textureType] || '#8b7355';
    };

    return (
        <div className="relative w-full h-screen bg-[#0a0a0f]">
            {/* 3D Galaxy Scene */}
            <GalaxyScene
                chatbots={chatbots}
                onPlanetClick={handlePlanetClick}
                focusedPlanetId={selectedBotId || undefined}
            />

            {/* UI Overlay */}
            <UIOverlay user={user} />

            {/* Loading State */}
            {isLoadingChatbots && chatbots.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white/70 text-sm">Loading your bots...</div>
                </div>
            )}

            {/* Empty State */}
            {!isLoadingChatbots && chatbots.length === 0 && user && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center space-y-2">
                        <p className="text-white/90 text-lg font-medium">No bots yet</p>
                        <p className="text-white/60 text-sm">Click the + button to create your first study bot!</p>
                    </div>
                </div>
            )}

            {/* Chat Modal */}
            {selectedBot && (
                <ChatModal
                    bot={selectedBot}
                    planetColor={getPlanetColor(selectedBot.planetData.textureType)}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
