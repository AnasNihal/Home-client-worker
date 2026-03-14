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
