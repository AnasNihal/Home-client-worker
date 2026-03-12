// src/components/WorkerRestrictedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthData } from '../utlis/useHelper';

const WorkerRestrictedRoute = ({ children }) => {
  const { user } = getAuthData();
  const location = useLocation();

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is admin, redirect to admin dashboard
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If user is a worker, only allow dashboard routes
  if (user.role === 'worker') {
    const allowedPaths = ['/worker/dashboard', '/worker/summary'];
    const currentPath = location.pathname;

    if (!allowedPaths.includes(currentPath)) {
      return <Navigate to="/worker/dashboard" replace />;
    }
  }

  // If user is not a worker or admin (regular user), allow all routes
  return children;
};

export default WorkerRestrictedRoute;
