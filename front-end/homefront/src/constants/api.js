/**
 * API Constants
 * Centralized API endpoint URLs for the Home Services application
 */

export const API_BASE_URL = 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/api/login/`,
  REGISTER: `${API_BASE_URL}/api/register/`,
  
  // Users
  USER_PROFILE: `${API_BASE_URL}/api/user/profile/`,
  USER_BOOKINGS: `${API_BASE_URL}/api/user/bookings/`,
  
  // Workers
  WORKERS: `${API_BASE_URL}/workers/`,
  WORKER_DASHBOARD: `${API_BASE_URL}/worker/dashboard/`,
  WORKER_DETAILS: (id) => `${API_BASE_URL}/workers/${id}/`,
  RATE_WORKER: (id) => `${API_BASE_URL}/workers/${id}/rate/`,
  
  // Bookings
  BOOKINGS: `${API_BASE_URL}/api/bookings/`,
  BOOKING_DETAILS: (id) => `${API_BASE_URL}/api/bookings/${id}/`,
  CREATE_BOOKING: `${API_BASE_URL}/api/bookings/`,
  
  // Payments
  PAYMENT_SUCCESS: `${API_BASE_URL}/api/payment/success/`,
  PAYMENT_CANCEL: `${API_BASE_URL}/api/payment/cancel/`,
  CREATE_CHECKOUT: `${API_BASE_URL}/api/create-checkout-session/`,
  
  // Services
  SERVICES: `${API_BASE_URL}/api/services/`,
  PROFESSIONS: `${API_BASE_URL}/professions/`,
  
  // Admin
  ADMIN_LOGIN: `${API_BASE_URL}/api/superadmin/login/`,
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/superadmin/stats/`,
  ADMIN_USERS: `${API_BASE_URL}/api/superadmin/users/`,
  ADMIN_WORKERS: `${API_BASE_URL}/api/superadmin/workers/`,
  ADMIN_BOOKINGS: `${API_BASE_URL}/api/superadmin/bookings/`,
  ADMIN_SERVICES: `${API_BASE_URL}/api/superadmin/services/`,
};

export default API_ENDPOINTS;
