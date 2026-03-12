// Secure authentication utility with httpOnly cookies support
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export async function secureFetch(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  // For authentication requests, include credentials
  const fetchOptions = {
    ...options,
    credentials: 'include', // This sends httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  let response = await fetch(fullUrl, fetchOptions);

  // Handle 401 unauthorized - try to refresh token via cookies
  if (response.status === 401) {
    // Try to refresh token using httpOnly cookies
    const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (refreshResponse.ok) {
      // Retry original request after successful refresh
      response = await fetch(fullUrl, fetchOptions);
    } else {
      // Refresh failed - redirect to login
      window.location.href = '/login';
      return null;
    }
  }

  return response;
}

export async function login(credentials) {
  const response = await secureFetch('/api/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (response.ok) {
    const data = await response.json();
    // Store minimal user data in localStorage (non-sensitive)
    localStorage.setItem('user', JSON.stringify({
      username: data.username,
      role: data.role
    }));
    return data;
  } else {
    throw new Error('Login failed');
  }
}

export async function logout() {
  try {
    await secureFetch('/api/logout/', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = '/login';
  }
}

export function getUser() {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

export function isAuthenticated() {
  return getUser() !== null;
}

export function hasRole(requiredRole) {
  const user = getUser();
  return user && user.role === requiredRole;
}
