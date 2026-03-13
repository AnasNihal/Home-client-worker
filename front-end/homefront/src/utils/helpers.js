/**
 * Common Helper Functions
 * Reusable utility functions for the Home Services application
 */

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString();
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '₹')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '₹') => {
  if (!amount && amount !== 0) return 'N/A';
  return `${currency}${amount.toLocaleString()}`;
};

/**
 * Get status color for bookings
 * @param {string} status - Booking status
 * @returns {object} Color configuration
 */
export const getBookingStatusColor = (status) => {
  const colors = {
    pending: { bg: '#FCD34D20', text: '#FCD34D' },
    confirmed: { bg: '#3B82F620', text: '#3B82F6' },
    in_progress: { bg: '#8B5CF620', text: '#8B5CF6' },
    completed: { bg: '#10B98120', text: '#10B981' },
    cancelled: { bg: '#EF444420', text: '#EF4444' },
  };
  return colors[status] || { bg: '#6B728020', text: '#6B7280' };
};

/**
 * Get payment status color
 * @param {string} status - Payment status
 * @returns {object} Color configuration
 */
export const getPaymentStatusColor = (status) => {
  const colors = {
    paid: { bg: '#10B98120', text: '#10B981' },
    pending: { bg: '#FCD34D20', text: '#FCD34D' },
    failed: { bg: '#EF444420', text: '#EF4444' },
    refunded: { bg: '#3B82F620', text: '#3B82F6' },
  };
  return colors[status] || { bg: '#6B728020', text: '#6B7280' };
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
};

/**
 * Generate star rating display
 * @param {number} rating - Rating value (0-5)
 * @param {number} maxRating - Maximum rating (default: 5)
 * @returns {array} Array of star objects
 */
export const generateStarRating = (rating, maxRating = 5) => {
  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    stars.push({
      filled: i <= rating,
      value: i
    });
  }
  return stars;
};

/**
 * Debounce function to limit API calls
 * @param {function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Check if user has specific role
 * @param {object} user - User object
 * @param {string|array} roles - Role(s) to check
 * @returns {boolean} User has required role
 */
export const hasRole = (user, roles) => {
  if (!user || !user.role) return false;
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  return user.role === roles;
};

export default {
  formatDate,
  formatCurrency,
  getBookingStatusColor,
  getPaymentStatusColor,
  truncateText,
  isValidEmail,
  isValidPhone,
  generateStarRating,
  debounce,
  hasRole
};
