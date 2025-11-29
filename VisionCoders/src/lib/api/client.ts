import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- API Functions ---

// 1. Create Bot
export const createBot = async (name: string, description: string, userId: string) => {
    const response = await api.post('/bot', { name, description, userId });
    return response.data;
};

// 2. Upload PDF
export const uploadPDF = async (file: File, botId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('botId', botId);
    const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// 3. Process PDF
export const processPDF = async (fileId: string, filePath: string, botId: string) => {
    const response = await api.post('/process-pdf', { fileId, filePath, botId });
    return response.data;
};

// 4. Generate Embeddings
export const generateEmbeddings = async (chunks: any[], fileId: string, botId: string) => {
    const response = await api.post('/embed', { chunks, fileId, botId });
    return response.data;
};

// 5. Chat & Commands
export const sendChatMessage = async (message: string, botId: string, userId: string) => {
    const response = await api.post('/chat', { message, botId, userId });
    return response.data;
};

export const generateSummary = async (botId: string, userId: string) => {
    const response = await api.post('/summarize', { botId, userId });
    return response.data;
};

export const generateNotes = async (botId: string, userId: string) => {
    const response = await api.post('/short-notes', { botId, userId });
    return response.data;
};

export const generateQuiz = async (botId: string, userId: string, questionCount: number = 10) => {
    const response = await api.post('/quiz', { botId, userId, questionCount });
    return response.data;
};
