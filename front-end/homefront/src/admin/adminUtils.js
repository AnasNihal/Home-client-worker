// Admin authentication utilities
export const getAdminToken = () => {
  return sessionStorage.getItem('adminToken');
};

export const getAdminUser = () => {
  const adminUser = sessionStorage.getItem('adminUser');
  return adminUser ? JSON.parse(adminUser) : {};
};

export const clearAdminSession = () => {
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminRefresh');
  sessionStorage.removeItem('adminUser');
};

export const setAdminSession = (token, refresh, user) => {
  sessionStorage.setItem('adminToken', token);
  sessionStorage.setItem('adminRefresh', refresh);
  sessionStorage.setItem('adminUser', JSON.stringify(user));
};

export const isAdminAuthenticated = () => {
  return !!sessionStorage.getItem('adminToken');
};

export const adminFetch = async (url, options = {}) => {
  const token = getAdminToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 || response.status === 403) {
    clearAdminSession();
  }
  return response;
};

export const readAdminError = async (response, fallback = 'Something went wrong') => {
  try {
    const data = await response.json();
    return data.error || data.detail || fallback;
  } catch (error) {
    return fallback;
  }
};
