/**
 * API Constants
 * Centralized API endpoint URLs for the Home Services application
 */

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login/`,
  USER_REGISTER: `${API_BASE_URL}/auth/user/register/`,
  WORKER_REGISTER: `${API_BASE_URL}/auth/worker/register/`,
  TOKEN_REFRESH: `${API_BASE_URL}/auth/token/refresh/`,
  
  // Users
  USER_PROFILE: `${API_BASE_URL}/user/profile/`,
  USER_BOOKINGS: `${API_BASE_URL}/user/bookings/`,
  
  // Workers
  WORKERS: `${API_BASE_URL}/workers/`,
  WORKER_DASHBOARD: `${API_BASE_URL}/worker/dashboard/`,
  WORKER_DETAILS: (id) => `${API_BASE_URL}/workers/${id}/`,
  RATE_WORKER: (id) => `${API_BASE_URL}/workers/${id}/rate/`,
  
  // Bookings
  CREATE_BOOKING: (workerId) => `${API_BASE_URL}/workers/${workerId}/book/`,
  UPDATE_BOOKING_STATUS: (id) => `${API_BASE_URL}/bookings/${id}/update-status/`,
  CANCEL_BOOKING: (id) => `${API_BASE_URL}/bookings/${id}/cancel/`,
  COMPLETE_BOOKING: (id) => `${API_BASE_URL}/bookings/${id}/complete/`,
  
  // Payments
  CREATE_CHECKOUT: (bookingId) => `${API_BASE_URL}/payments/stripe/checkout/${bookingId}/`,
  CREATE_CHECKOUT_NEW: (workerId) => `${API_BASE_URL}/payments/stripe/checkout/new/${workerId}/`,
  CONFIRM_STRIPE_PAYMENT: `${API_BASE_URL}/payments/stripe/confirm/`,
  
  // Services
  PROFESSIONS: `${API_BASE_URL}/professions/`,
  AI_SERVICE_INTAKE: `${API_BASE_URL}/ai/service-intake/`,
  AI_RECOMMEND_WORKERS: `${API_BASE_URL}/ai/recommend-workers/`,
  AI_SUPPORT_CHAT: `${API_BASE_URL}/ai/support-chat/`,
  AI_ANALYZE_IMAGE: `${API_BASE_URL}/ai/analyze-image/`,
  
  // Admin
  ADMIN_LOGIN: `${API_BASE_URL}/api/superadmin/login/`,
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/superadmin/stats/`,
  ADMIN_USERS: `${API_BASE_URL}/api/superadmin/users/`,
  ADMIN_WORKERS: `${API_BASE_URL}/api/superadmin/workers/`,
  ADMIN_BOOKINGS: `${API_BASE_URL}/api/superadmin/bookings/`,
  ADMIN_PAYMENTS: `${API_BASE_URL}/api/superadmin/payments/`,
  ADMIN_SERVICES: `${API_BASE_URL}/api/superadmin/services/`,
  ADMIN_SERVICE: (id) => `${API_BASE_URL}/api/superadmin/services/${id}/`,
  ADMIN_REVIEWS: `${API_BASE_URL}/api/superadmin/reviews/`,
  ADMIN_REVIEW: (id) => `${API_BASE_URL}/api/superadmin/reviews/${id}/`,
  ADMIN_USER: (id) => `${API_BASE_URL}/api/superadmin/users/${id}/`,
  ADMIN_USER_STATUS: (id) => `${API_BASE_URL}/api/superadmin/users/${id}/toggle-status/`,
  ADMIN_WORKER: (id) => `${API_BASE_URL}/api/superadmin/workers/${id}/`,
  ADMIN_WORKER_STATUS: (id) => `${API_BASE_URL}/api/superadmin/workers/${id}/toggle-availability/`,
  ADMIN_WORKER_VERIFY: (id) => `${API_BASE_URL}/api/superadmin/workers/${id}/verify/`,
  ADMIN_BOOKING: (id) => `${API_BASE_URL}/api/superadmin/bookings/${id}/`,
  ADMIN_BOOKING_CANCEL: (id) => `${API_BASE_URL}/api/superadmin/bookings/${id}/cancel/`,
};

export default API_ENDPOINTS;
