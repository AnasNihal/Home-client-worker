// src/components/WorkerRestrictedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthData } from '../utils/useHelper';

const WorkerRestrictedRoute = ({ children }) => {
  const { user } = getAuthData();
  const location = useLocation();

  // If user is not logged in, allow access to public routes
  if (!user) {
    return children;
  }

  // If user is a superuser, redirect to admin login
  if (user.is_superuser || user.role === 'admin') {
    console.log("Redirecting admin user to admin login. Role:", user.role, "Is Superuser:", user.is_superuser);
    return <Navigate to="/admin/login" replace />;
  }

  // If user is a worker, only allow dashboard routes
  if (user.role === 'worker') {
    const allowedPaths = ['/worker/dashboard', '/worker/summary'];
    const currentPath = location.pathname;

    if (!allowedPaths.includes(currentPath)) {
      return <Navigate to="/worker/dashboard" replace />;
    }
  }

  // If user is not a worker or superuser (regular user), allow all routes
  console.log("Allowing access for user. Role:", user.role, "Is Superuser:", user.is_superuser);
  return children;
};

export default WorkerRestrictedRoute;
