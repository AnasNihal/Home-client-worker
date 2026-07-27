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
  
  // Admin
  ADMIN_LOGIN: `${API_BASE_URL}/api/superadmin/login/`,
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/superadmin/stats/`,
  ADMIN_USERS: `${API_BASE_URL}/api/superadmin/users/`,
  ADMIN_WORKERS: `${API_BASE_URL}/api/superadmin/workers/`,
  ADMIN_BOOKINGS: `${API_BASE_URL}/api/superadmin/bookings/`,
  ADMIN_PAYMENTS: `${API_BASE_URL}/api/superadmin/payments/`,
  ADMIN_SERVICES: `${API_BASE_URL}/api/superadmin/services/`,
};

export default API_ENDPOINTS;
