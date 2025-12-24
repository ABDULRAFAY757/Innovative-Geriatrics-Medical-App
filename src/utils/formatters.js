/**
 * Utility functions for formatting data
 */

/**
 * Format a date string based on locale and format type
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale code (e.g., 'ar-SA', 'en-US')
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, locale = 'en-US', options = {}) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  };

  return date.toLocaleDateString(locale, defaultOptions);
};

/**
 * Format a date with time
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale code
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (dateString, locale = 'en-US') => {
  return formatDate(dateString, locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a date as short format (MMM DD)
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale code
 * @returns {string} Formatted short date
 */
export const formatShortDate = (dateString, locale = 'en-US') => {
  return formatDate(dateString, locale, {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get relative time string (e.g., "5 min ago", "2 hours ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return formatShortDate(dateString);
};

/**
 * Calculate age from date of birth
 * @param {string} dateOfBirth - Date of birth in ISO format
 * @returns {number} Age in years
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;

  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: SAR)
 * @param {string} locale - Locale code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'SAR', locale = 'en-US') => {
  if (typeof amount !== 'number') return '0';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency === 'SAR' ? 'SAR' : currency,
  }).format(amount);
};

/**
 * Format a number with thousand separators
 * @param {number} num - Number to format
 * @param {string} locale - Locale code
 * @returns {string} Formatted number string
 */
export const formatNumber = (num, locale = 'en-US') => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString(locale);
};

/**
 * Format card number with spaces (XXXX XXXX XXXX XXXX)
 * @param {string} value - Card number input
 * @returns {string} Formatted card number
 */
export const formatCardNumber = (value) => {
  const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const match = cleaned.match(/\d{1,4}/g);
  return match ? match.join(' ') : cleaned;
};

/**
 * Format expiry date (MM/YY)
 * @param {string} value - Expiry date input
 * @returns {string} Formatted expiry date
 */
export const formatExpiryDate = (value) => {
  const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '...';
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 * @returns {string} Initials
 */
export const getInitials = (name, maxInitials = 2) => {
  if (!name) return 'U';

  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, maxInitials)
    .toUpperCase();
};

/**
 * Sanitize and format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as Saudi phone number if it matches the pattern
  if (cleaned.startsWith('966') && cleaned.length === 12) {
    return `+966 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  return phone;
};
