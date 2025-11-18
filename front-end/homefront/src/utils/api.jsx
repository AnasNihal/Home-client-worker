/**
 * API Helper - Works in both local and production
 * Local: Uses http://127.0.0.1:8000 (when React dev server runs separately)
 * Production: Uses relative URLs (when served from Django)
 */

const getBaseURL = () => {
  // If running React dev server on localhost:3000
  if (window.location.port === '3000') {
    return 'http://127.0.0.1:8000';
  }
  
  // If running from Django (localhost:8000 or production)
  return '';
};

export const API_BASE_URL = getBaseURL();

/**
 * Fetch with authentication
 */
export const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
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
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

/**
 * Get full image URL
 */
export const getImageURL = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
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
 * PUT request
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