/**
 * Security utilities for sanitizing user input and preventing XSS attacks
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeInput = (html) => {
  if (!html) return '';
  
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

/**
 * Validates and sanitizes a filename to prevent path traversal and injection attacks
 * @param {string} filename - The original filename
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  if (!filename) return 'unnamed';
  
  // Remove path traversal attempts and special characters
  const sanitized = filename
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\.\./g, '')
    .trim();
  
  // Ensure filename doesn't start with a dot (hidden files)
  return sanitized.startsWith('.') ? '_' + sanitized : sanitized;
};

/**
 * Generates a secure random ID
 * @returns {string} - A unique ID
 */
export const generateSecureId = () => {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'id-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};
