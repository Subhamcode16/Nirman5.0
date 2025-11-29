import { FileText, Download, Trash2, RefreshCw, CheckCircle, Clock, XCircle, Circle } from 'lucide-react';
import { useState } from 'react';
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

interface PDFListItemProps {
    pdf: PDFDocument;
    onDelete: (id: string) => void;
    onRetry: (id: string) => void;
    onDownload: (filePath: string, filename: string) => void;
}

export default function PDFListItem({ pdf, onDelete, onRetry, onDownload }: PDFListItemProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusBadge = () => {
        switch (pdf.processing_status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Processed
                    </span>
                );
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        <Clock className="w-3 h-3 animate-spin" />
                        Processing
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        Failed
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        <Circle className="w-3 h-3" />
                        Pending
                    </span>
                );
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${pdf.filename}"?`)) {
            setIsDeleting(true);
            try {
                await onDelete(pdf.id);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className={clsx(
            'flex items-center gap-4 p-4 rounded-lg border transition-all',
            isDeleting ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50',
            'border-gray-200'
        )}>
            {/* PDF Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
            </div>

            {/* PDF Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                        {pdf.filename}
                    </h4>
                    {getStatusBadge()}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatFileSize(pdf.file_size)}</span>
                    {pdf.page_count && (
                        <>
                            <span>•</span>
                            <span>{pdf.page_count} pages</span>
                        </>
                    )}
                    <span>•</span>
                    <span>Added {formatDate(pdf.created_at)}</span>
                </div>
                {pdf.error_message && (
                    <p className="mt-1 text-xs text-red-600">{pdf.error_message}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Download Button */}
                {pdf.processing_status === 'completed' && (
                    <button
                        onClick={() => onDownload(pdf.file_path, pdf.filename)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        title="Download PDF"
                    >
                        <Download className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                    </button>
                )}

                {/* Retry Button (for failed PDFs) */}
                {pdf.processing_status === 'failed' && (
                    <button
                        onClick={() => onRetry(pdf.id)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                        title="Retry Processing"
                    >
                        <RefreshCw className="w-4 h-4 text-blue-500 group-hover:text-blue-700" />
                    </button>
                )}

                {/* Delete Button */}
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors group disabled:opacity-50"
                    title="Delete PDF"
                >
                    <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                </button>
            </div>
        </div>
    );
}
