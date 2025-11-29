import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';
import { uploadPDF } from '../../lib/api/uploads';
import { useChatStore } from '../../store/useChatStore';
import clsx from 'clsx';

interface UploadProgress {
    phase: 'uploading' | 'extracting' | 'chunking' | 'embedding' | 'complete';
    progress: number;
    message: string;
}

interface AddPDFDialogProps {
    botId: string;
    botName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddPDFDialog({ botId, botName, isOpen, onClose, onSuccess }: AddPDFDialogProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const { addXP } = useChatStore();

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
            validateAndSetFile(droppedFile);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        // Validate file type
        if (selectedFile.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            setFile(null);
            return;
        }

        // Validate file size (50MB max)
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (selectedFile.size > maxSize) {
            setError('File size must be less than 50 MB');
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a PDF file');
            return;
        }

        setError(null);
        setIsUploading(true);

        try {
            await uploadPDF(botId, file, (progress) => {
                setUploadProgress(progress);
            });

            // Award XP for upload
            await addXP(botId, 30, 'UPLOAD_PDF');

            // Award XP for processing completion
            await addXP(botId, 20, 'PDF_PROCESSING');

            // Success!
            setTimeout(() => {
                handleSuccess();
            }, 1000);

        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload PDF');
            setIsUploading(false);
            setUploadProgress(null);
        }
    };

    const handleSuccess = () => {
        onSuccess();
        handleClose();
    };

    const handleClose = () => {
        if (!isUploading) {
            onClose();
            // Reset form after animation
            setTimeout(() => {
                setFile(null);
                setError(null);
                setUploadProgress(null);
            }, 300);
        }
    };

    const getProgressMessage = () => {
        if (!uploadProgress) return '';

        switch (uploadProgress.phase) {
            case 'uploading':
                return 'Uploading PDF to storage...';
            case 'extracting':
                return 'Extracting text from PDF...';
            case 'chunking':
                return 'Chunking document...';
            case 'embedding':
                return 'Generating embeddings...';
            case 'complete':
                return 'PDF processed successfully!';
            default:
                return uploadProgress.message;
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
                    className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Add PDF</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Upload to {botName}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isUploading}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {isUploading ? (
                            <div className="space-y-4">
                                {/* Progress Animation */}
                                <div className="text-center py-8">
                                    <div className="relative w-20 h-20 mx-auto mb-4">
                                        {uploadProgress?.phase === 'complete' ? (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                                            >
                                                <CheckCircle className="w-10 h-10 text-green-600" />
                                            </motion.div>
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
                                                <motion.div
                                                    className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                />
                                            </>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        {getProgressMessage()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {uploadProgress?.progress.toFixed(0)}% complete
                                    </p>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-blue-600 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress?.progress || 0}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                {/* File Upload Area */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select PDF File <span className="text-red-500">*</span>
                                    </label>
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        className={clsx(
                                            "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                                            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
                                            file ? "bg-green-50 border-green-200" : ""
                                        )}
                                    >
                                        <input
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="pdf-file-upload"
                                        />
                                        <label htmlFor="pdf-file-upload" className="cursor-pointer w-full h-full block">
                                            {file ? (
                                                <div className="flex items-center justify-center gap-3 text-green-700">
                                                    <FileText className="w-10 h-10" />
                                                    <div className="text-left">
                                                        <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                                                        <p className="text-xs opacity-70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                        <Upload className="w-6 h-6 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                                        <p className="text-xs text-gray-500 mt-1">PDF files only (max 50MB)</p>
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={!file}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        Upload PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
