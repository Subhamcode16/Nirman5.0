import { supabase } from '../supabase';

// =============================================
// Type Definitions
// =============================================

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

interface UploadProgress {
    phase: 'uploading' | 'extracting' | 'chunking' | 'embedding' | 'complete';
    progress: number; // 0-100
    message: string;
}

// =============================================
// PDF Upload Functions
// =============================================

/**
 * Upload a PDF file to Supabase Storage and create database record
 */
export async function uploadPDF(
    chatbotId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
): Promise<PDFDocument> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw new Error('Not authenticated');
    }

    // Validate file
    if (!file.type.includes('pdf')) {
        throw new Error('File must be a PDF');
    }

    if (file.size > 52428800) { // 50 MB
        throw new Error('File size must be less than 50 MB');
    }

    // Report upload start
    onProgress?.({
        phase: 'uploading',
        progress: 0,
        message: 'Uploading PDF to storage...',
    });

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userData.user.id}/${chatbotId}/${timestamp}_${sanitizedFilename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('pdf-documents')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) {
        console.error('Error uploading PDF:', uploadError);
        throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    onProgress?.({
        phase: 'uploading',
        progress: 50,
        message: 'PDF uploaded successfully',
    });

    // Create database record
    const { data: pdfDoc, error: dbError } = await supabase
        .from('pdf_documents')
        .insert({
            chatbot_id: chatbotId,
            user_id: userData.user.id,
            filename: file.name,
            file_path: filePath,
            file_size: file.size,
            processing_status: 'pending',
        })
        .select()
        .single();

    if (dbError) {
        // Cleanup: delete uploaded file if DB insert fails
        await supabase.storage.from('pdf-documents').remove([filePath]);
        console.error('Error creating PDF document record:', dbError);
        throw new Error(`Failed to create PDF record: ${dbError.message}`);
    }

    onProgress?.({
        phase: 'extracting',
        progress: 60,
        message: 'Processing PDF...',
    });

    // Trigger PDF processing
    try {
        await triggerPDFProcessing(pdfDoc.id, onProgress);
    } catch (error) {
        console.error('Error processing PDF:', error);
        // Don't throw - the PDF is uploaded, processing can be retried
    }

    return pdfDoc as PDFDocument;
}

/**
 * Trigger PDF processing - calls backend APIs to process and embed PDF
 */
async function triggerPDFProcessing(
    documentId: string,
    onProgress?: (progress: UploadProgress) => void
): Promise<void> {
    try {
        // Get document details
        const { data: pdfDoc, error: fetchError } = await supabase
            .from('pdf_documents')
            .select('*')
            .eq('id', documentId)
            .single();

        if (fetchError || !pdfDoc) {
            throw new Error('Failed to fetch PDF document');
        }

        onProgress?.({
            phase: 'extracting',
            progress: 60,
            message: 'Extracting text from PDF...',
        });

        // Step 1: Process PDF (extract text and create chunks)
        // Use relative URL to avoid double /api/ issue
        const processResponse = await fetch('/api/process-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileId: pdfDoc.id,
                filePath: pdfDoc.file_path,
                botId: pdfDoc.chatbot_id,
            }),
        });

        if (!processResponse.ok) {
            const errorText = await processResponse.text();
            let errorMessage = `HTTP ${processResponse.status}: Failed to process PDF`;

            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error?.details || errorData.error?.message || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }

            console.error('Process PDF error:', errorMessage);
            throw new Error(errorMessage);
        }

        const processData = await processResponse.json();
        const chunks = processData.data.chunks;

        if (!chunks || chunks.length === 0) {
            throw new Error('No text could be extracted from the PDF');
        }

        onProgress?.({
            phase: 'chunking',
            progress: 75,
            message: `Created ${chunks.length} chunks...`,
        });

        // Step 2: Generate embeddings and save to database
        onProgress?.({
            phase: 'embedding',
            progress: 85,
            message: 'Generating embeddings...',
        });

        const embedResponse = await fetch('/api/embed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chunks,
                fileId: pdfDoc.id,
                botId: pdfDoc.chatbot_id,
            }),
        });

        if (!embedResponse.ok) {
            const errorText = await embedResponse.text();
            let errorMessage = `HTTP ${embedResponse.status}: Failed to generate embeddings`;

            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error?.details || errorData.error?.message || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }

            console.error('Embed error:', errorMessage);
            throw new Error(errorMessage);
        }

        const embedData = await embedResponse.json();

        onProgress?.({
            phase: 'complete',
            progress: 100,
            message: `PDF processed successfully! ${embedData.data.insertedCount} embeddings created.`,
        });

    } catch (error) {
        console.error('Error in triggerPDFProcessing:', error);

        // Update status to failed
        await supabase
            .from('pdf_documents')
            .update({
                processing_status: 'failed',
                error_message: error instanceof Error ? error.message : 'Processing failed',
            })
            .eq('id', documentId);

        // Show error to user
        onProgress?.({
            phase: 'extracting',
            progress: 0,
            message: `Error: ${error instanceof Error ? error.message : 'Processing failed'}`,
        });

        throw error;
    }
}

/**
 * Fetch all PDF documents for a chatbot
 */
export async function fetchChatbotPDFs(chatbotId: string): Promise<PDFDocument[]> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
        .from('pdf_documents')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching PDFs:', error);
        throw new Error(`Failed to fetch PDFs: ${error.message}`);
    }

    return data as PDFDocument[];
}

/**
 * Delete a PDF document and its associated data
 */
export async function deletePDF(documentId: string): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw new Error('Not authenticated');
    }

    // Get file path before deleting
    const { data: pdfDoc } = await supabase
        .from('pdf_documents')
        .select('file_path')
        .eq('id', documentId)
        .eq('user_id', userData.user.id)
        .single();

    if (!pdfDoc) {
        throw new Error('PDF document not found');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from('pdf-documents')
        .remove([pdfDoc.file_path]);

    if (storageError) {
        console.error('Error deleting PDF from storage:', storageError);
    }

    // Delete from database (cascades to document_chunks)
    const { error } = await supabase
        .from('pdf_documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', userData.user.id);

    if (error) {
        console.error('Error deleting PDF record:', error);
        throw new Error(`Failed to delete PDF: ${error.message}`);
    }
}

/**
 * Get download URL for a PDF
 */
export async function getPDFDownloadURL(filePath: string): Promise<string> {
    const { data } = await supabase.storage
        .from('pdf-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (!data) {
        throw new Error('Failed to generate download URL');
    }

    return data.signedUrl;
}

/**
 * Retry processing for a failed PDF
 */
export async function retryPDFProcessing(documentId: string): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw new Error('Not authenticated');
    }

    // Update status to pending
    const { error } = await supabase
        .from('pdf_documents')
        .update({
            processing_status: 'pending',
            error_message: null,
        })
        .eq('id', documentId)
        .eq('user_id', userData.user.id);

    if (error) {
        console.error('Error retrying PDF processing:', error);
        throw new Error(`Failed to retry processing: ${error.message}`);
    }

    // Trigger processing again
    await triggerPDFProcessing(documentId);
}
