import React, { useState, useCallback } from 'react';
import { useTaskAttachments } from '../../hooks/useTaskActivity';
import Button from '../common/Button';
import FileIcon from '../common/FileIcon';
import { formatFileSize } from '../../utils/fileUtils';

/**
 * TaskAttachments component - Manages file attachments for a task
 * @param {Array} initialAttachments - Initial attachments array
 * @param {Function} onSave - Callback to save attachments to parent
 * @returns {JSX.Element}
 */
const TaskAttachments = ({ initialAttachments = [], onSave }) => {
  const { attachments, uploading, error, uploadFile, deleteAttachment, clearError, setAttachments } = useTaskAttachments(initialAttachments);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    clearError();
    const attachment = await uploadFile(file);
    
    if (attachment && onSave) {
      onSave([...attachments, attachment]);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
    e.target.value = ''; // Reset input
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    await handleFileSelect(file);
  }, [attachments, onSave]);

  const handleDelete = (attachmentId) => {
    const updatedAttachments = attachments.filter(a => a.id !== attachmentId);
    deleteAttachment(attachmentId);
    
    if (onSave) {
      onSave(updatedAttachments);
    }
  };

  const handleDownload = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-var(--primary) bg-var(--primary-light)' 
            : 'border-var(--border) hover:border-var(--primary)'
        }`}
      >
        <svg className="w-12 h-12 mx-auto var(--muted-ink) mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m0-3v12" />
        </svg>
        <p className="var(--ink) font-medium mb-1">
          {uploading ? 'Uploading...' : 'Drag & drop a file here'}
        </p>
        <p className="text-sm var(--muted-ink) mb-3">
          or click to browse (max 5MB)
        </p>
        <input
          type="file"
          onChange={handleInputChange}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button 
            type="button" 
            variant="secondary"
            disabled={uploading}
            as="span"
            className="cursor-pointer"
          >
            Browse Files
          </Button>
        </label>
        
        {error && (
          <p className="text-sm var(--danger) mt-3">{error}</p>
        )}
      </div>

      {/* Attachments List */}
      <div className="space-y-2">
        {attachments.length === 0 ? (
          <p className="text-sm var(--muted-ink) text-center py-4">
            No attachments yet. Upload a file to get started.
          </p>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="bg-var(--white) border border-var(--border) rounded-lg p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-var(--primary) flex-shrink-0">
                    <FileIcon type={attachment.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm var(--ink) truncate">{attachment.name}</p>
                    <p className="text-xs var(--muted-ink)">
                      {attachment.sizeFormatted} • Uploaded {formatDate(attachment.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => handleDownload(attachment)}
                    className="text-xs var(--primary) hover:underline px-2 py-1"
                    aria-label="Download file"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(attachment.id)}
                    className="text-xs var(--danger) hover:underline px-2 py-1"
                    aria-label="Delete attachment"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskAttachments;
