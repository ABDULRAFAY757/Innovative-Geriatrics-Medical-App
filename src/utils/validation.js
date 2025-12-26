/**
 * Input Validation Utilities
 * Comprehensive validation functions for all form inputs
 */

export const validators = {
  // Required field validator
  required: (value) => {
    const trimmed = typeof value === 'string' ? value.trim() : value;
    return trimmed !== '' && trimmed !== null && trimmed !== undefined;
  },

  // Length validators
  maxLength: (max) => (value) => {
    return !value || value.length <= max;
  },

  minLength: (min) => (value) => {
    return !value || value.length >= min;
  },

  // Email validator
  email: (value) => {
    if (!value) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // Phone validator (international format)
  phone: (value) => {
    if (!value) return true;
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
    return phoneRegex.test(value);
  },

  // Future date validator
  futureDate: (value) => {
    if (!value) return true;
    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate >= today;
  },

  // Past date validator
  pastDate: (value) => {
    if (!value) return true;
    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return inputDate <= today;
  },

  // Positive number validator
  positiveNumber: (value) => {
    if (!value) return true;
    return !isNaN(value) && Number(value) > 0;
  },

  // Number range validator
  numberRange: (min, max) => (value) => {
    if (!value) return true;
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  // URL validator
  url: (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // Alphanumeric validator
  alphanumeric: (value) => {
    if (!value) return true;
    return /^[a-zA-Z0-9\s]+$/.test(value);
  },

  // No special characters except spaces and basic punctuation
  safeText: (value) => {
    if (!value) return true;
    return /^[a-zA-Z0-9\s.,!?'-]+$/.test(value);
  }
};

/**
 * Validation error messages
 */
export const errorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  futureDate: 'Date must be in the future',
  pastDate: 'Date must be in the past',
  positiveNumber: 'Must be a positive number',
  minLength: (min) => `Must be at least ${min} characters`,
  maxLength: (max) => `Must be no more than ${max} characters`,
  numberRange: (min, max) => `Must be between ${min} and ${max}`,
  url: 'Please enter a valid URL',
  alphanumeric: 'Only letters and numbers allowed',
  safeText: 'Invalid characters detected'
};

/**
 * Validate a single field
 * @param {*} value - Field value
 * @param {Array} rules - Array of validation rule objects
 * @returns {string|null} - Error message or null
 */
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const { validator, message } = rule;
    if (!validator(value)) {
      return message || 'Invalid input';
    }
  }
  return null;
};

/**
 * Validate entire form
 * @param {Object} values - Form values
 * @param {Object} validationSchema - Validation rules for each field
 * @returns {Object} - Errors object
 */
export const validateForm = (values, validationSchema) => {
  const errors = {};

  Object.keys(validationSchema).forEach(fieldName => {
    const rules = validationSchema[fieldName];
    const error = validateField(values[fieldName], rules);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Check if form has errors
 * @param {Object} errors - Errors object
 * @returns {boolean}
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Common validation schemas for reuse
 */
export const validationSchemas = {
  appointment: {
    doctor_id: [
      { validator: validators.required, message: errorMessages.required }
    ],
    date: [
      { validator: validators.required, message: errorMessages.required }
      // Removed futureDate validator - it was causing issues with ISO datetime format
    ],
    location: [
      { validator: validators.required, message: errorMessages.required }
    ],
    notes: [
      { validator: validators.maxLength(500), message: errorMessages.maxLength(500) }
    ]
    // Removed 'time' validation - time is included in the ISO date string
  },

  medication: {
    medication_name: [
      { validator: validators.required, message: errorMessages.required },
      { validator: validators.maxLength(100), message: errorMessages.maxLength(100) }
    ],
    dosage: [
      { validator: validators.required, message: errorMessages.required },
      { validator: validators.maxLength(50), message: errorMessages.maxLength(50) }
    ],
    frequency: [
      { validator: validators.required, message: errorMessages.required }
    ]
  },

  careTask: {
    title: [
      { validator: validators.required, message: errorMessages.required },
      { validator: validators.minLength(3), message: errorMessages.minLength(3) },
      { validator: validators.maxLength(100), message: errorMessages.maxLength(100) }
    ],
    description: [
      { validator: validators.maxLength(500), message: errorMessages.maxLength(500) }
    ],
    due_date: [
      { validator: validators.required, message: errorMessages.required },
      { validator: validators.futureDate, message: errorMessages.futureDate }
    ]
  },

  equipmentRequest: {
    equipment_name: [
      { validator: validators.required, message: errorMessages.required },
      { validator: validators.maxLength(100), message: errorMessages.maxLength(100) }
    ],
    description: [
      { validator: validators.required, message: errorMessages.required },
      { validator: validators.maxLength(1000), message: errorMessages.maxLength(1000) }
    ],
    medical_justification: [
      { validator: validators.required, message: errorMessages.required },
      { validator: validators.maxLength(500), message: errorMessages.maxLength(500) }
    ],
    estimated_cost: [
      { validator: validators.required, message: errorMessages.required },
      { validator: validators.positiveNumber, message: 'Cost must be a positive number' },
      { validator: validators.numberRange(1, 1000000), message: 'Cost must be between 1 and 1,000,000 SAR' }
    ]
  },

  donation: {
    amount: [
      { validator: validators.required, message: errorMessages.required },
      { validator: validators.positiveNumber, message: 'Amount must be a positive number' },
      { validator: validators.numberRange(1, 1000000), message: 'Amount must be between 1 and 1,000,000 SAR' }
    ]
  }
};
