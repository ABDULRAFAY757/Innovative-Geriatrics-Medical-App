/**
 * Application-wide constants
 */

// UI Constants
export const COLORS = {
  BLUE: 'blue',
  GREEN: 'green',
  PURPLE: 'purple',
  ORANGE: 'orange',
  RED: 'red',
  YELLOW: 'yellow',
};

export const SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
};

export const BADGE_VARIANTS = {
  DEFAULT: 'default',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
};

export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  DANGER: 'danger',
  SUCCESS: 'success',
  WARNING: 'warning',
};

export const ALERT_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  FAMILY: 'family',
  DOCTOR: 'doctor',
  DONOR: 'donor',
};

// Status Constants
export const STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In Progress',
  CANCELLED: 'Cancelled',
  CONFIRMED: 'Confirmed',
  SCHEDULED: 'Scheduled',
  FULFILLED: 'Fulfilled',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  RESOLVED: 'Resolved',
};

// Priority Levels
export const PRIORITY = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

// Fall Risk Levels
export const FALL_RISK = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  MADA_CARD: 'mada_card',
  APPLE_PAY: 'apple_pay',
  BANK_TRANSFER: 'bank_transfer',
};

// Equipment Categories
export const EQUIPMENT_CATEGORIES = {
  MOBILITY: 'Mobility',
  MONITORING: 'Monitoring',
  SAFETY: 'Safety',
  HOME_CARE: 'Home Care',
};

// Health Metrics Types
export const HEALTH_METRICS = {
  BLOOD_PRESSURE: 'Blood Pressure',
  BLOOD_SUGAR: 'Blood Sugar',
  HEART_RATE: 'Heart Rate',
  WEIGHT: 'Weight',
  TEMPERATURE: 'Temperature',
  OXYGEN_LEVEL: 'Oxygen Level',
};

// Date/Time Formats
export const DATE_FORMATS = {
  FULL: 'full',
  SHORT: 'short',
  RELATIVE: 'relative',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'geriatrics_user',
  LANGUAGE: 'geriatrics_language',
  THEME: 'geriatrics_theme',
};

// API Configuration (for future use)
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
};

// Validation Constants
export const VALIDATION = {
  CARD_NUMBER_MAX_LENGTH: 19,
  EXPIRY_DATE_MAX_LENGTH: 5,
  CVV_MAX_LENGTH: 4,
  PHONE_MIN_LENGTH: 10,
  PASSWORD_MIN_LENGTH: 8,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Animation Durations (in ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};
