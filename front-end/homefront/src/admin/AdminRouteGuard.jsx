import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AdminRouteGuard = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const adminToken = sessionStorage.getItem('adminToken'); // Use sessionStorage instead of localStorage
        
        if (!adminToken) {
          setError('Admin authentication required');
          setIsLoading(false);
          return;
        }

        // Verify admin token by calling admin me endpoint
        const response = await fetch('http://127.0.0.1:8000/api/superadmin/me/', {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setIsAdmin(true);
        } else {
          setError('Invalid admin session');
          sessionStorage.removeItem('adminToken'); // Use sessionStorage
          sessionStorage.removeItem('adminRefresh'); // Use sessionStorage
          sessionStorage.removeItem('adminUser'); // Use sessionStorage
        }
      } catch (err) {
        setError('Authentication check failed');
        sessionStorage.removeItem('adminToken'); // Use sessionStorage
        sessionStorage.removeItem('adminRefresh'); // Use sessionStorage
        sessionStorage.removeItem('adminUser'); // Use sessionStorage
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRouteGuard;
