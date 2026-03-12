// src/components/AdminRestrictedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthData } from '../utlis/useHelper';

const AdminRestrictedRoute = ({ children }) => {
  const { user } = getAuthData();
  const location = useLocation();

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is not admin, redirect based on role
  if (user.role !== 'admin') {
    if (user.role === 'worker') {
      return <Navigate to="/worker/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // If user is admin, allow access
  return children;
};

export default AdminRestrictedRoute;
