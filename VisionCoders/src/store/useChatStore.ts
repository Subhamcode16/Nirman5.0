import { create } from 'zustand';
import type { ChatBot } from '../types/galaxy';
import { supabase } from '../lib/supabase';
import * as api from '../lib/api/client'; // Use new API client
import * as legacyApi from '../lib/api'; // Keep legacy for fetchUserChatbots if needed
import type { RealtimeChannel } from '@supabase/supabase-js';
import { XP_REWARDS, type XPRewardAction } from '../lib/xp-utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface ChatState {
    // Upload state
    isUploading: boolean;
    uploadProgress: number;
    uploadStatus: 'idle' | 'extracting' | 'chunking' | 'embedding' | 'complete' | 'error';
    isUploadModalOpen: boolean;

    // UI state
    isSidebarOpen: boolean;

    // Chat state
    messages: Message[];

    // Chatbot state
    chatbots: ChatBot[];
    isLoadingChatbots: boolean;
    newPlanetId: string | null; // For birth animation
    selectedBotId: string | null; // For chat modal

    // Real-time subscription
    realtimeChannel: RealtimeChannel | null;

    // XP state
    xpToasts: Array<{
        id: string;
        botId: string;
        xpAmount: number;
        action: XPRewardAction;
        planetName: string;
        timestamp: number;
    }>;
    levelUpQueue: Array<{
        botId: string;
        oldLevel: number;
        newLevel: number;
        planetName: string;
    }>;

    // Upload actions
    setUploading: (isUploading: boolean) => void;
    setUploadProgress: (progress: number) => void;
    setUploadStatus: (status: ChatState['uploadStatus']) => void;
    setUploadModalOpen: (isOpen: boolean) => void;

    // UI actions
    toggleSidebar: () => void;

    // Chat actions
    addMessage: (message: Message) => void;
    sendMessage: (content: string, botId: string, userId: string) => Promise<void>;
    clearMessages: () => void;

    // Chatbot actions
    loadChatbots: () => Promise<void>;
    createChatbot: (name: string, description: string, userId: string) => Promise<ChatBot>;
    deleteChatbot: (id: string) => Promise<void>;
    updateChatbotActivity: (botId: string, activity: number) => Promise<void>;
    clearNewPlanetId: () => void;
    setSelectedBot: (botId: string | null) => void;

    // Real-time actions
    initializeRealtime: () => () => void;

    // XP actions
    addXP: (botId: string, xpAmount: number, action: XPRewardAction) => Promise<void>;
    dismissXPToast: (toastId: string) => void;
    clearLevelUpQueue: (botId: string) => void;

    // New API actions
    generateSummary: (botId: string, userId: string) => Promise<void>;
    generateNotes: (botId: string, userId: string) => Promise<void>;
    generateQuiz: (botId: string, userId: string) => Promise<void>;

    // Upload flow
    handleFileUpload: (file: File, botId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    // Initial state
    isUploading: false,
    uploadProgress: 0,
    uploadStatus: 'idle',
    isUploadModalOpen: false,
    isSidebarOpen: true,
    messages: [],
    chatbots: [],
    isLoadingChatbots: false,
    newPlanetId: null,
    selectedBotId: null,
    realtimeChannel: null,
    xpToasts: [],
    levelUpQueue: [],

    // Upload actions
    setUploading: (isUploading) => set({ isUploading }),
    setUploadProgress: (uploadProgress) => set({ uploadProgress }),
    setUploadStatus: (uploadStatus) => set({ uploadStatus }),
    setUploadModalOpen: (isUploadModalOpen) => set({ isUploadModalOpen }),

    // UI actions
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    // Chat actions
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

    sendMessage: async (content, botId, userId) => {
        // Add user message immediately
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now(),
        };
        set((state) => ({ messages: [...state.messages, userMsg] }));

        try {
            // Call Backend
            const data = await api.sendChatMessage(content, botId, userId);

            // Add assistant response
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.data.message, // Assuming response structure from guide
                timestamp: Date.now(),
            };
            set((state) => ({ messages: [...state.messages, botMsg] }));

            // Add XP for chatting
            get().addXP(botId, XP_REWARDS.ASK_QUESTION, 'ASK_QUESTION');
        } catch (error) {
            console.error("Chat failed:", error);
            // Optionally add error message to chat
        }
    },

    clearMessages: () => set({ messages: [] }),

    // Chatbot actions
    loadChatbots: async () => {
        set({ isLoadingChatbots: true });
        try {
            // Use legacy API for fetching list if new API doesn't support it yet
            // Or assume legacyApi.fetchUserChatbots is still valid
            const chatbots = await legacyApi.fetchUserChatbots();
            set({ chatbots, isLoadingChatbots: false });
        } catch (error) {
            console.error('Error loading chatbots:', error);
            set({ isLoadingChatbots: false });
        }
    },

    createChatbot: async (name: string, description: string, userId: string) => {
        try {
            const response = await api.createBot(name, description, userId);
            const newBot = response.data; // Assuming response structure

            // Add to local state with newlyCreated flag
            // Note: We might need to map the API response to ChatBot type if they differ
            // For now assuming they are compatible or we rely on realtime update

            // If realtime is working, we might not need to manually add it here
            // But let's keep it for immediate feedback

            // Transform if necessary...

            return newBot;
        } catch (error) {
            console.error('Error creating chatbot:', error);
            throw error;
        }
    },

    deleteChatbot: async (id: string) => {
        try {
            await legacyApi.deleteChatbot(id); // Use legacy for now if not in new API
            set((state) => ({
                chatbots: state.chatbots.filter((bot) => bot.id !== id),
            }));
        } catch (error) {
            console.error('Error deleting chatbot:', error);
            throw error;
        }
    },

    updateChatbotActivity: async (botId: string, activity: number) => {
        try {
            await legacyApi.updateChatbotActivity(botId, activity);
            set((state) => ({
                chatbots: state.chatbots.map((bot) =>
                    bot.id === botId
                        ? { ...bot, planetData: { ...bot.planetData, activity } }
                        : bot
                ),
            }));
        } catch (error) {
            console.error('Error updating chatbot activity:', error);
        }
    },

    clearNewPlanetId: () => set({ newPlanetId: null }),

    setSelectedBot: (botId) => set({ selectedBotId: botId }),

    // Real-time subscription
    initializeRealtime: () => {
        const channel = supabase
            .channel('chatbots-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chatbots',
                },
                (payload) => {
                    console.log('New chatbot detected:', payload);
                    // ... existing logic ...
                    const dbBot = payload.new as any;
                    const newBot: ChatBot = {
                        id: dbBot.id,
                        name: dbBot.name,
                        description: dbBot.description,
                        xp: dbBot.xp,
                        pdfCount: dbBot.pdf_count,
                        lastActivity: new Date(dbBot.last_activity),
                        planetData: {
                            orbitRadius: dbBot.orbit_radius,
                            orbitSpeed: dbBot.orbit_speed,
                            textureType: dbBot.texture_type,
                            size: dbBot.planet_size,
                            activity: dbBot.activity,
                            angleOffset: dbBot.angle_offset,
                        },
                        isNewlyCreated: true,
                    };

                    const currentBots = get().chatbots;
                    if (!currentBots.find((bot) => bot.id === newBot.id)) {
                        set((state) => ({
                            chatbots: [...state.chatbots, newBot],
                            newPlanetId: newBot.id,
                        }));
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'chatbots',
                },
                (payload) => {
                    console.log('Chatbot updated:', payload);
                    // ... existing logic ...
                    const dbBot = payload.new as any;
                    const updatedBot: ChatBot = {
                        id: dbBot.id,
                        name: dbBot.name,
                        description: dbBot.description,
                        xp: dbBot.xp,
                        pdfCount: dbBot.pdf_count,
                        lastActivity: new Date(dbBot.last_activity),
                        planetData: {
                            orbitRadius: dbBot.orbit_radius,
                            orbitSpeed: dbBot.orbit_speed,
                            textureType: dbBot.texture_type,
                            size: dbBot.planet_size,
                            activity: dbBot.activity,
                            angleOffset: dbBot.angle_offset,
                        },
                    };

                    set((state) => ({
                        chatbots: state.chatbots.map((bot) =>
                            bot.id === updatedBot.id ? updatedBot : bot
                        ),
                    }));
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'chatbots',
                },
                (payload) => {
                    console.log('Chatbot deleted:', payload);
                    const deletedId = (payload.old as any).id;
                    set((state) => ({
                        chatbots: state.chatbots.filter((bot) => bot.id !== deletedId),
                    }));
                }
            )
            .subscribe();

        set({ realtimeChannel: channel });

        return () => {
            supabase.removeChannel(channel);
            set({ realtimeChannel: null });
        };
    },

    // XP actions
    addXP: async (botId: string, xpAmount: number, action: XPRewardAction) => {
        try {
            const bot = get().chatbots.find(b => b.id === botId);
            if (!bot) return;

            // Use legacy API for XP since it's likely Supabase based
            const result = await legacyApi.addXPWithLevelCheck(botId, xpAmount);

            set((state) => ({
                chatbots: state.chatbots.map((b) =>
                    b.id === botId ? result.bot : b
                ),
            }));

            const toastId = `${botId}-${Date.now()}`;
            set((state) => ({
                xpToasts: [
                    ...state.xpToasts,
                    {
                        id: toastId,
                        botId,
                        xpAmount,
                        action,
                        planetName: bot.name,
                        timestamp: Date.now(),
                    },
                ],
            }));

            if (result.leveledUp) {
                set((state) => ({
                    levelUpQueue: [
                        ...state.levelUpQueue,
                        {
                            botId,
                            oldLevel: result.oldLevel,
                            newLevel: result.newLevel,
                            planetName: bot.name,
                        },
                    ],
                }));
            }
        } catch (error) {
            console.error('Error adding XP:', error);
        }
    },

    dismissXPToast: (toastId: string) => {
        set((state) => ({
            xpToasts: state.xpToasts.filter((toast) => toast.id !== toastId),
        }));
    },

    clearLevelUpQueue: (botId: string) => {
        set((state) => ({
            levelUpQueue: state.levelUpQueue.filter((item) => item.botId !== botId),
        }));
    },

    // New API actions
    generateSummary: async (botId: string, userId: string) => {
        try {
            const data = await api.generateSummary(botId, userId);
            const botMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: data.data.summary || "Summary generated.",
                timestamp: Date.now(),
            };
            set((state) => ({ messages: [...state.messages, botMsg] }));
            get().addXP(botId, XP_REWARDS.UPLOAD_PDF, 'UPLOAD_PDF'); // Or specific reward
        } catch (error) {
            console.error("Summary failed:", error);
        }
    },

    generateNotes: async (botId: string, userId: string) => {
        try {
            const data = await api.generateNotes(botId, userId);
            const botMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: data.data.notes || "Notes generated.",
                timestamp: Date.now(),
            };
            set((state) => ({ messages: [...state.messages, botMsg] }));
        } catch (error) {
            console.error("Notes failed:", error);
        }
    },

    generateQuiz: async (botId: string, userId: string) => {
        try {
            const data = await api.generateQuiz(botId, userId);
            const botMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: JSON.stringify(data.data.quiz) || "Quiz generated.",
                timestamp: Date.now(),
            };
            set((state) => ({ messages: [...state.messages, botMsg] }));
        } catch (error) {
            console.error("Quiz failed:", error);
        }
    },

    // Upload flow
    handleFileUpload: async (file: File, botId: string) => {
        set({ isUploading: true, uploadStatus: 'extracting', uploadProgress: 0 });
        try {
            // 1. Upload
            set({ uploadStatus: 'extracting', uploadProgress: 10 });
            const uploadRes = await api.uploadPDF(file, botId);
            const { fileId, filePath } = uploadRes.data;
            set({ uploadProgress: 40 });

            // 2. Process
            set({ uploadStatus: 'chunking', uploadProgress: 50 });
            const processRes = await api.processPDF(fileId, filePath, botId);
            const { chunks } = processRes.data;
            set({ uploadProgress: 70 });

            // 3. Embed
            set({ uploadStatus: 'embedding', uploadProgress: 80 });
            await api.generateEmbeddings(chunks, fileId, botId);
            set({ uploadStatus: 'complete', uploadProgress: 100 });

            set({ isUploading: false });
            get().addXP(botId, XP_REWARDS.UPLOAD_PDF, 'UPLOAD_PDF');
        } catch (error) {
            console.error("Pipeline failed:", error);
            set({ isUploading: false, uploadStatus: 'error' });
        }
    }
}));
