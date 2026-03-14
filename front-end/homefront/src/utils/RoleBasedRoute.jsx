import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, allowedRoles, fallbackPath = '/login' }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user?.role || 'guest';
  const isSuperuser = user?.is_superuser || false;

  // Check if user is authenticated
  if (!user.username) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user has allowed role
  if (allowedRoles.includes(userRole)) {
    return children;
  }

  // Redirect based on user's actual role
  if (isSuperuser) {
    return <Navigate to="/admin/login" replace />;
  } else if (userRole === 'worker') {
    return <Navigate to="/worker/dashboard" replace />;
  } else {
    return <Navigate to="/profile/me" replace />;
  }
};

export default RoleBasedRoute;
