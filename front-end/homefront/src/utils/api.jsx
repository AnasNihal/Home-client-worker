/**
 * API Helper - Works in both local and production
 * Local: Uses http://127.0.0.1:8000 (when React dev server runs separately)
 * Production: Uses relative URLs (when served from Django)
 */

const getBaseURL = () => {
  // If running React dev server on localhost:3000
  if (window.location.port === '3000') {
    return 'http://127.0.0.1:8000/api';
  }
  
  // If running from Django (localhost:8000 or production)
  return '/api';  // ← Changed from '' to '/api'
};

export const API_BASE_URL = getBaseURL();

/**
 * Get CSRF token from cookie
 */
const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

/**
 * Fetch with authentication (for JSON data)
 */
export const fetchAPI = async (endpoint, options = {}) => {
  console.log("FINAL URL:", `${API_BASE_URL}${endpoint}`);
  
  const token = endpoint.includes('/auth/login')
    ? null
    : localStorage.getItem('access');

  const csrfToken = getCookie('csrftoken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(csrfToken && { 'X-CSRFToken': csrfToken }),
    },
    credentials: 'include',
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `API error: ${response.status}`);
  }

  return response.json();
};

/**
 * Upload files with FormData (for file uploads)
 */
export const uploadAPI = async (endpoint, formData, method = 'PUT') => {
  const token = localStorage.getItem('access');
  const csrfToken = getCookie('csrftoken');
  
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(csrfToken && { 'X-CSRFToken': csrfToken }),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Upload error: ${response.status}`);
  }

  return response.json();
};

/**
 * Get full image URL
 */
export const getImageURL = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  // Handle media files
  if (imagePath.startsWith('/media')) return imagePath;
  
  // If running from Django server
  if (window.location.port !== '3000') {
    return imagePath; // Already has full path
  }
  
  // If running from React dev server
  return `http://127.0.0.1:8000${imagePath}`;
};

/**
 * POST request
 */
export const postAPI = async (endpoint, data) => {
  return fetchAPI(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request (for JSON data)
 */
export const putAPI = async (endpoint, data) => {
  return fetchAPI(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 */
export const deleteAPI = async (endpoint) => {
  return fetchAPI(endpoint, {
    method: 'DELETE',
  });
};