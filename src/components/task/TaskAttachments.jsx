import { useState, useCallback } from 'react';
import Button from '../common/Button';
import FileIcon from '../common/FileIcon';
import { validateFile, sanitizeFilename } from '../../utils/fileUtils';

const TaskAttachments = ({ taskId, attachments, onAddAttachment, onDeleteAttachment }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFile = useCallback(async (file) => {
    setUploadError('');
    
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const newAttachment = {
        id: crypto.randomUUID(),
        name: sanitizeFilename(file.name),
        size: file.size,
        type: file.type,
        url: e.target.result,
        uploadedAt: new Date().toISOString()
      };
      
      await onAddAttachment(taskId, newAttachment);
    };
    reader.readAsDataURL(file);
  }, [taskId, onAddAttachment]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDelete = (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      onDeleteAttachment(taskId, attachmentId);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="task-attachments">
      <div
        className={`task-attachments__dropzone ${isDragging ? 'task-attachments__dropzone--active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="file-upload"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" className="task-attachments__label">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <p>Drag & drop files here or <span>browse</span></p>
          <span className="task-attachments__hint">Max 5MB. Supported: images, docs, zips</span>
        </label>
      </div>

      {uploadError && <p className="task-attachments__error">{uploadError}</p>}

      {attachments.length > 0 && (
        <div className="task-attachments__list">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="task-attachment">
              <FileIcon filename={attachment.name} size={32} />
              <div className="task-attachment__info">
                <p className="task-attachment__name">{attachment.name}</p>
                <p className="task-attachment__size">{formatFileSize(attachment.size)}</p>
              </div>
              <button
                className="task-attachment__delete"
                onClick={() => handleDelete(attachment.id)}
                aria-label="Delete attachment"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .task-attachments {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .task-attachments__dropzone {
          border: 2px dashed var(--gray-300);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .task-attachments__dropzone--active {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
        }
        .task-attachments__label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          color: var(--gray-600);
        }
        .task-attachments__label p {
          margin: 0;
          font-weight: 500;
        }
        .task-attachments__label span {
          color: var(--primary);
          text-decoration: underline;
        }
        .task-attachments__hint {
          font-size: 0.75rem;
          color: var(--gray-500);
        }
        .task-attachments__error {
          color: #ef4444;
          font-size: 0.875rem;
          margin: 0;
        }
        .task-attachments__list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .task-attachment {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: var(--gray-50);
          border-radius: 8px;
          border: 1px solid var(--gray-200);
        }
        .task-attachment__info {
          flex: 1;
          min-width: 0;
        }
        .task-attachment__name {
          margin: 0;
          font-weight: 500;
          color: var(--ink);
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .task-attachment__size {
          margin: 0.25rem 0 0;
          font-size: 0.75rem;
          color: var(--gray-500);
        }
        .task-attachment__delete {
          background: none;
          border: none;
          color: var(--gray-400);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .task-attachment__delete:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        [data-theme="dark"] .task-attachments__dropzone {
          border-color: var(--gray-700);
        }
        [data-theme="dark"] .task-attachment {
          background: var(--gray-800);
          border-color: var(--gray-700);
        }
        [data-theme="dark"] .task-attachment__name {
          color: var(--gray-200);
        }
      `}</style>
    </div>
  );
};

export default TaskAttachments;
