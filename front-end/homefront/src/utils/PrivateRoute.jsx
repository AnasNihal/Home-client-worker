/**
 * PrivateRoute Component
 * Route protection component for authenticated users
 * Redirects based on user role and authentication status
 */

import { Navigate } from "react-router-dom";

const PrivateRoute = ({ role, children }) => {
  let user = null;
  const userData = localStorage.getItem("user");

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (err) {
    console.error("Invalid user data in localStorage:", userData);
    user = null;
  }

  // 🔒 Not logged in → redirect
  if (!user) return <Navigate to="/login" replace />;

  // 🔒 Wrong role → redirect to their dashboard/home
  if (role && user.role !== role) {
    switch (user.role) {
      case "user":
        return <Navigate to="/profile/me" replace />;
      case "worker":
        return <Navigate to="/worker/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // ✅ Correct role → allow page
  return children;
};

export default PrivateRoute;
