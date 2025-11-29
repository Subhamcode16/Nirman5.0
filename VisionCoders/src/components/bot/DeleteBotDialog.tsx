import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import type { ChatBot } from '../../types/galaxy';

interface DeleteBotDialogProps {
    bot: ChatBot;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteBotDialog({ bot, isOpen, onClose, onConfirm }: DeleteBotDialogProps) {
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Reset confirmation text when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            setConfirmText('');
        }
    }, [isOpen]);

    const isConfirmValid = confirmText === bot.name;

    const handleConfirm = async () => {
        if (!isConfirmValid) return;

        setIsDeleting(true);
        try {
            await onConfirm();
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-red-50">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-red-900">
                                Delete Bot
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="p-1 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5 text-red-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {/* Warning Message */}
                        <div className="space-y-2">
                            <p className="text-sm text-gray-900 font-medium">
                                You are about to permanently delete <span className="font-bold text-red-600">{bot.name}</span>.
                            </p>
                            <p className="text-sm text-gray-600">
                                This action cannot be undone. The following will be deleted:
                            </p>
                        </div>

                        {/* Consequences List */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                            <div className="flex items-start gap-2 text-sm text-red-800">
                                <span className="font-medium">•</span>
                                <span>
                                    <strong>{bot.pdfCount} PDF{bot.pdfCount !== 1 ? 's' : ''}</strong> and all associated data
                                </span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-800">
                                <span className="font-medium">•</span>
                                <span>
                                    All chat history and conversations
                                </span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-800">
                                <span className="font-medium">•</span>
                                <span>
                                    <strong>{bot.xp} XP</strong> and all progress
                                </span>
                            </div>
                        </div>

                        {/* Confirmation Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Type <span className="font-mono bg-gray-100 px-1 rounded">{bot.name}</span> to confirm:
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                disabled={isDeleting}
                                placeholder={bot.name}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!isConfirmValid || isDeleting}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Bot'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
