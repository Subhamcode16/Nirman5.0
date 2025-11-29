import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, FileText, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { updateChatbot } from '../../lib/api/chatbots';
import { fetchChatbotPDFs, deletePDF, getPDFDownloadURL, retryPDFProcessing } from '../../lib/api/uploads';
import { deleteChatbot } from '../../lib/api/chatbots';
import type { ChatBot } from '../../types/galaxy';
import PDFListItem from './PDFListItem';
import DeleteBotDialog from './DeleteBotDialog';
import AddPDFDialog from './AddPDFDialog';
import clsx from 'clsx';

interface PDFDocument {
    id: string;
    chatbot_id: string;
    user_id: string;
    filename: string;
    file_path: string;
    file_size: number;
    page_count: number | null;
    processing_status: 'pending' | 'processing' | 'completed' | 'failed';
    error_message: string | null;
    created_at: string;
    processed_at: string | null;
}

interface BotSettingsModalProps {
    bot: ChatBot;
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'general' | 'pdfs' | 'danger';

export default function BotSettingsModal({ bot, isOpen, onClose }: BotSettingsModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [botName, setBotName] = useState(bot.name);
    const [botDescription, setBotDescription] = useState(bot.description);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // PDF Management state
    const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
    const [isLoadingPDFs, setIsLoadingPDFs] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    // Delete Bot state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Add PDF state
    const [isAddPDFDialogOpen, setIsAddPDFDialogOpen] = useState(false);

    // Reset form when bot changes
    useEffect(() => {
        setBotName(bot.name);
        setBotDescription(bot.description);
        setHasUnsavedChanges(false);
    }, [bot]);

    // Track unsaved changes
    useEffect(() => {
        const hasChanges = botName !== bot.name || botDescription !== bot.description;
        setHasUnsavedChanges(hasChanges);
    }, [botName, botDescription, bot]);

    // Fetch PDFs when PDFs tab is opened
    useEffect(() => {
        if (activeTab === 'pdfs' && isOpen) {
            loadPDFs();
        }
    }, [activeTab, isOpen]);

    const loadPDFs = async () => {
        setIsLoadingPDFs(true);
        setPdfError(null);
        try {
            const data = await fetchChatbotPDFs(bot.id);
            setPdfs(data);
        } catch (err) {
            setPdfError(err instanceof Error ? err.message : 'Failed to load PDFs');
        } finally {
            setIsLoadingPDFs(false);
        }
    };

    const handleSave = async () => {
        if (!botName.trim()) {
            setError('Bot name cannot be empty');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await updateChatbot(bot.id, {
                name: botName.trim(),
                description: botDescription.trim(),
            });

            setHasUnsavedChanges(false);
            // Success notification would go here
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update bot');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setBotName(bot.name);
        setBotDescription(bot.description);
        setHasUnsavedChanges(false);
    };

    const handleDeletePDF = async (pdfId: string) => {
        try {
            await deletePDF(pdfId);
            setPdfs(prev => prev.filter(p => p.id !== pdfId));
            // Success notification would go here
        } catch (err) {
            setPdfError(err instanceof Error ? err.message : 'Failed to delete PDF');
        }
    };

    const handleRetryPDF = async (pdfId: string) => {
        try {
            await retryPDFProcessing(pdfId);
            await loadPDFs(); // Reload to get updated status
            // Success notification would go here
        } catch (err) {
            setPdfError(err instanceof Error ? err.message : 'Failed to retry processing');
        }
    };

    const handleDownloadPDF = async (filePath: string, filename: string) => {
        try {
            const url = await getPDFDownloadURL(filePath);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setPdfError(err instanceof Error ? err.message : 'Failed to download PDF');
        }
    };

    const handleDeleteBot = async () => {
        try {
            await deleteChatbot(bot.id);
            // Close both dialogs
            setIsDeleteDialogOpen(false);
            onClose();
            // Success notification would go here
            // The bot will be removed from the galaxy via real-time subscription
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete bot');
            setIsDeleteDialogOpen(false);
        }
    };

    const handleAddPDFSuccess = () => {
        // Reload PDFs after successful upload
        loadPDFs();
        setIsAddPDFDialogOpen(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={clsx(
                        'bg-white rounded-xl shadow-xl overflow-hidden',
                        activeTab === 'pdfs' ? 'w-full max-w-3xl' : 'w-full max-w-2xl'
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                Bot Settings: {bot.name}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 px-4">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={clsx(
                                'px-4 py-3 text-sm font-medium transition-colors relative',
                                activeTab === 'general'
                                    ? 'text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            )}
                        >
                            General
                            {activeTab === 'general' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('pdfs')}
                            className={clsx(
                                'px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2',
                                activeTab === 'pdfs'
                                    ? 'text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            )}
                        >
                            <FileText className="w-4 h-4" />
                            PDFs ({bot.pdfCount})
                            {activeTab === 'pdfs' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('danger')}
                            className={clsx(
                                'px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2',
                                activeTab === 'danger'
                                    ? 'text-red-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            )}
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Danger Zone
                            {activeTab === 'danger' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                                />
                            )}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* General Settings Tab */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                {hasUnsavedChanges && (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-sm text-amber-700">You have unsaved changes</p>
                                    </div>
                                )}

                                {/* Bot Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bot Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={botName}
                                        onChange={(e) => setBotName(e.target.value)}
                                        maxLength={50}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{botName.length}/50 characters</p>
                                </div>

                                {/* Bot Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={botDescription}
                                        onChange={(e) => setBotDescription(e.target.value)}
                                        maxLength={200}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{botDescription.length}/200 characters</p>
                                </div>

                                {/* Statistics */}
                                <div className="pt-4 border-t border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Statistics</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Created</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(bot.lastActivity).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Last Active</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(bot.lastActivity).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">XP / Level</p>
                                            <p className="font-medium text-gray-900">
                                                {bot.xp} XP • Level {Math.floor(bot.xp / 20) + 1}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">PDFs</p>
                                            <p className="font-medium text-gray-900">{bot.pdfCount} documents</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={handleCancel}
                                        disabled={!hasUnsavedChanges || isSaving}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={!hasUnsavedChanges || isSaving}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PDF Management Tab */}
                        {activeTab === 'pdfs' && (
                            <div className="space-y-4">
                                {pdfError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-700">{pdfError}</p>
                                    </div>
                                )}

                                {/* Header with Add PDF button */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">PDF Documents</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {pdfs.length} document{pdfs.length !== 1 ? 's' : ''} •
                                            {(pdfs.reduce((sum, pdf) => sum + pdf.file_size, 0) / (1024 * 1024)).toFixed(1)} MB total
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddPDFDialogOpen(true)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add PDF
                                    </button>
                                </div>

                                {/* PDF List */}
                                {isLoadingPDFs ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-sm text-gray-500 mt-2">Loading PDFs...</p>
                                    </div>
                                ) : pdfs.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-gray-900">No PDFs yet</p>
                                        <p className="text-xs text-gray-500 mt-1">Add your first PDF to train this bot.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {pdfs.map(pdf => (
                                            <PDFListItem
                                                key={pdf.id}
                                                pdf={pdf}
                                                onDelete={handleDeletePDF}
                                                onRetry={handleRetryPDF}
                                                onDownload={handleDownloadPDF}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Danger Zone Tab */}
                        {activeTab === 'danger' && (
                            <div className="space-y-6">
                                {/* Warning Section */}
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-semibold text-red-900">Danger Zone</h3>
                                            <p className="text-sm text-red-700 mt-1">
                                                Actions in this section are irreversible. Please proceed with caution.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete Bot Section */}
                                <div className="border border-red-200 rounded-lg p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                Delete this bot
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Once you delete a bot, there is no going back. This will permanently delete:
                                            </p>
                                            <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                                                    All {bot.pdfCount} PDF document{bot.pdfCount !== 1 ? 's' : ''}
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                                                    All chat history and conversations
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                                                    {bot.xp} XP and all progress
                                                </li>
                                            </ul>
                                        </div>
                                        <button
                                            onClick={() => setIsDeleteDialogOpen(true)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            Delete Bot
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Delete Bot Dialog */}
            <DeleteBotDialog
                bot={bot}
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteBot}
            />

            {/* Add PDF Dialog */}
            <AddPDFDialog
                botId={bot.id}
                botName={bot.name}
                isOpen={isAddPDFDialogOpen}
                onClose={() => setIsAddPDFDialogOpen(false)}
                onSuccess={handleAddPDFSuccess}
            />
        </AnimatePresence>
    );
}
