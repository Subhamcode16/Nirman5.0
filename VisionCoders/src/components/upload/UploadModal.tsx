import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import clsx from 'clsx';
import TrainingLoader from '../ui/TrainingLoader';

export default function UploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [botName, setBotName] = useState('');
    const [botDescription, setBotDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuthStore();
    const {
        isUploading,
        setUploading,
        setUploadProgress,
        setUploadStatus,
        createChatbot,
        handleFileUpload, // Use new store action
    } = useChatStore();

    // ... existing drag/drop handlers ...
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setError(null);
            } else {
                setError('Please upload a PDF file');
            }
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please upload a PDF file');
            }
        }
    };

    const handleUpload = async () => {
        if (!file || !botName.trim()) {
            setError('Please provide a bot name and PDF file');
            return;
        }

        if (!user) {
            setError('You must be logged in to create a bot');
            return;
        }

        setError(null);
        // setUploading(true); // Handled by handleFileUpload

        try {
            // Step 1: Create the chatbot
            const newBot = await createChatbot(botName.trim(), botDescription.trim(), user.id);

            // Step 2: Upload and Process PDF (using store action)
            await handleFileUpload(file, newBot.id);

            // Wait a bit before closing
            setTimeout(() => {
                handleTrainingComplete();
            }, 1500);

        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'Failed to create bot');
            setUploadStatus('error');
            setUploading(false);
        }
    };

    const handleTrainingComplete = () => {
        onClose();
        // Reset form
        setFile(null);
        setBotName('');
        setBotDescription('');
        setError(null);
        setUploadStatus('idle');
        setUploadProgress(0);
        setUploading(false);
    };

    const handleClose = () => {
        if (!isUploading) {
            onClose();
            // Reset form after animation
            setTimeout(() => {
                setFile(null);
                setBotName('');
                setBotDescription('');
                setError(null);
                setUploadStatus('idle');
                setUploadProgress(0);
            }, 300);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Create New Study Bot</h2>
                        <button
                            onClick={handleClose}
                            disabled={isUploading}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        {isUploading ? (
                            <TrainingLoader onComplete={handleTrainingComplete} />
                        ) : (
                            <div className="space-y-4">
                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                {/* Bot Name Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bot Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={botName}
                                        onChange={(e) => setBotName(e.target.value)}
                                        placeholder="e.g., Biology 101 Helper"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        maxLength={50}
                                    />
                                </div>

                                {/* Bot Description Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={botDescription}
                                        onChange={(e) => setBotDescription(e.target.value)}
                                        placeholder="What can this bot help you with?"
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                        maxLength={200}
                                    />
                                </div>

                                {/* File Upload Area */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Knowledge Source (PDF) <span className="text-red-500">*</span>
                                    </label>
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        className={clsx(
                                            "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
                                            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
                                            file ? "bg-green-50 border-green-200" : ""
                                        )}
                                    >
                                        <input
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer w-full h-full block">
                                            {file ? (
                                                <div className="flex items-center justify-center gap-3 text-green-700">
                                                    <FileText className="w-8 h-8" />
                                                    <div className="text-left">
                                                        <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                                                        <p className="text-xs opacity-70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                        <Upload className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                                        <p className="text-xs text-gray-500">PDF files only (max 50MB)</p>
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={!file || !botName.trim()}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    Begin Training Your Bot
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
