import { useState, useCallback } from 'react';
import { fileToBase64, validateFile, getFileTypeCategory, formatFileSize } from '../utils/fileUtils';
import { sanitizeFilename, generateSecureId } from '../utils/security';

/**
 * Custom hook for managing task comments
 * @param {Array} initialComments - Initial comments array
 * @returns {Object} - Comments state and actions
 */
export const useTaskComments = (initialComments = []) => {
  const [comments, setComments] = useState(initialComments);

  const addComment = useCallback((text, author = 'Current User') => {
    if (!text || !text.trim()) return null;

    const newComment = {
      id: generateSecureId(),
      text: text.trim(),
      author,
      createdAt: new Date().toISOString()
    };

    setComments(prev => [...prev, newComment]);
    return newComment;
  }, []);

  const deleteComment = useCallback((commentId) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  }, []);

  return {
    comments,
    addComment,
    deleteComment,
    setComments
  };
};

/**
 * Custom hook for managing task attachments
 * @param {Array} initialAttachments - Initial attachments array
 * @returns {Object} - Attachments state and actions
 */
export const useTaskAttachments = (initialAttachments = []) => {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = useCallback(async (file) => {
    setError(null);
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return null;
    }

    setUploading(true);

    try {
      // Convert to base64 for local storage
      const base64Data = await fileToBase64(file);
      
      const newAttachment = {
        id: generateSecureId(),
        name: sanitizeFilename(file.name),
        type: getFileTypeCategory(file.type),
        mimeType: file.type,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        data: base64Data,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Current User'
      };

      setAttachments(prev => [...prev, newAttachment]);
      return newAttachment;
    } catch (err) {
      setError('Failed to upload file');
      console.error('Upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteAttachment = useCallback((attachmentId) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== attachmentId));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    attachments,
    uploading,
    error,
    uploadFile,
    deleteAttachment,
    clearError,
    setAttachments
  };
};
