import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  const location = useLocation();

  if (!adminToken) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
