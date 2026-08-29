/**
 * File handling utilities for validation and processing
 */

// Allowed file types with their MIME types and extensions
const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  archives: ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed'],
  text: ['text/plain', 'text/csv']
};

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validates a file based on type and size
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error: string|null}} - Validation result
 */
export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}` 
    };
  }

  // Check file type
  const mimeType = file.type.toLowerCase();
  const isAllowed = Object.values(ALLOWED_FILE_TYPES).some(types => 
    types.includes(mimeType)
  );

  if (!isAllowed) {
    return { 
      valid: false, 
      error: 'File type not allowed. Please upload images, documents, spreadsheets, archives, or text files.' 
    };
  }

  return { valid: true, error: null };
};

/**
 * Gets the file type category
 * @param {string} mimeType - The MIME type of the file
 * @returns {string} - The category (image, document, spreadsheet, archive, text, other)
 */
export const getFileTypeCategory = (mimeType) => {
  if (!mimeType) return 'other';
  
  const type = mimeType.toLowerCase();
  
  if (ALLOWED_FILE_TYPES.images.includes(type)) return 'image';
  if (ALLOWED_FILE_TYPES.documents.includes(type)) return 'document';
  if (ALLOWED_FILE_TYPES.spreadsheets.includes(type)) return 'spreadsheet';
  if (ALLOWED_FILE_TYPES.archives.includes(type)) return 'archive';
  if (ALLOWED_FILE_TYPES.text.includes(type)) return 'text';
  
  return 'other';
};

/**
 * Formats file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Converts a file to base64 for storage
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};
