/**
 * Security Utilities
 * XSS prevention, input sanitization, and security helpers
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes or escapes dangerous HTML/JavaScript
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize HTML content (allows safe HTML tags)
 * @param {string} html - HTML string
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return html;

  // Allow only safe tags
  const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'];
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;

  return html.replace(tagRegex, (match, tag) => {
    return allowedTags.includes(tag.toLowerCase()) ? match : '';
  });
};

/**
 * Escape special characters in strings for safe database queries
 * @param {string} str - Input string
 * @returns {string} - Escaped string
 */
export const escapeSQL = (str) => {
  if (typeof str !== 'string') return str;

  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\x00/g, '\\0');
};

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeInput(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  Object.keys(obj).forEach(key => {
    sanitized[key] = sanitizeObject(obj[key]);
  });

  return sanitized;
};

/**
 * Rate limiter class
 * Prevents abuse by limiting actions per time window
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  /**
   * Check if action is allowed
   * @param {string} key - Unique identifier (e.g., user ID)
   * @returns {boolean} - Whether action is allowed
   */
  canProceed(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];

    // Remove old attempts outside time window
    const recentAttempts = userAttempts.filter(
      time => now - time < this.windowMs
    );

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  /**
   * Get remaining attempts
   * @param {string} key - Unique identifier
   * @returns {number} - Remaining attempts
   */
  getRemainingAttempts(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    const recentAttempts = userAttempts.filter(
      time => now - time < this.windowMs
    );
    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }

  /**
   * Reset attempts for a key
   * @param {string} key - Unique identifier
   */
  reset(key) {
    this.attempts.delete(key);
  }

  /**
   * Clear all attempts
   */
  clearAll() {
    this.attempts.clear();
  }
}

/**
 * Create rate limiters for different operations
 */
export const rateLimiters = {
  appointment: new RateLimiter(10, 60000), // 10 per minute
  medication: new RateLimiter(20, 60000),  // 20 per minute
  careTask: new RateLimiter(30, 60000),    // 30 per minute
  equipmentRequest: new RateLimiter(5, 300000), // 5 per 5 minutes
  donation: new RateLimiter(3, 60000),     // 3 per minute
  login: new RateLimiter(5, 300000),       // 5 per 5 minutes
};

/**
 * Validate file upload (for future use)
 * @param {File} file - File object
 * @param {Object} options - Validation options
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${maxSize / 1024 / 1024}MB`
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type'
    };
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Invalid file extension'
    };
  }

  return { valid: true, error: null };
};

/**
 * Generate secure random ID
 * @param {number} length - Length of ID
 * @returns {string} - Random ID
 */
export const generateSecureId = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
};

/**
 * Simple encryption for localStorage (Base64 encoding)
 * Note: This is NOT cryptographically secure, just obfuscation
 * For production, use a proper encryption library
 * @param {string} data - Data to encrypt
 * @returns {string} - Encrypted data
 */
export const encryptData = (data) => {
  try {
    return btoa(encodeURIComponent(JSON.stringify(data)));
  } catch (error) {
    console.error('Encryption error:', error);
    return data;
  }
};

/**
 * Simple decryption for localStorage
 * @param {string} encryptedData - Encrypted data
 * @returns {*} - Decrypted data
 */
export const decryptData = (encryptedData) => {
  try {
    return JSON.parse(decodeURIComponent(atob(encryptedData)));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Check if string contains potential XSS
 * @param {string} str - String to check
 * @returns {boolean} - True if potentially dangerous
 */
export const containsXSS = (str) => {
  if (typeof str !== 'string') return false;

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onload=, onclick=, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i
  ];

  return xssPatterns.some(pattern => pattern.test(str));
};

/**
 * Content Security Policy helper
 * Returns CSP headers for different environments
 */
export const getCSPDirectives = () => {
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  };
};

/**
 * Secure localStorage wrapper
 */
export const secureStorage = {
  setItem: (key, value) => {
    try {
      const encrypted = encryptData(value);
      localStorage.setItem(key, encrypted);
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  getItem: (key, defaultValue = null) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return defaultValue;
      return decryptData(encrypted) || defaultValue;
    } catch (error) {
      console.error('Storage error:', error);
      return defaultValue;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  }
};

export default {
  sanitizeInput,
  sanitizeHTML,
  sanitizeObject,
  escapeSQL,
  RateLimiter,
  rateLimiters,
  validateFileUpload,
  generateSecureId,
  encryptData,
  decryptData,
  containsXSS,
  getCSPDirectives,
  secureStorage
};
