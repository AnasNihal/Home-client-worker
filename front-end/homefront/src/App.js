  import React from 'react';
import { BrowserRouter , Routes, Route , useLocation} from 'react-router-dom';
import ScrollToTop from "./ScrollToTop"; 
import WorkerRestrictedRoute from './components/WorkerRestrictedRoute';
import RoleBasedRoute from './utils/RoleBasedRoute';

import Navbar from "./components/Navbar";
import BackButton from "./components/BackButton";
import WorkerPage from './pages/WorkerPage';
import Home from "./pages/Home";
import Footer from './components/Footer';
import AboutPage from './pages/AboutPage';
import WorkerDetails from './pages/WorkerDetails';
import ContactUs from './pages/ContactUs';
import BlogPage from './pages/BlogPage';
import FaqPage from './pages/FaqPage';
import Login from './pages/LoginPage';  
import Register from './pages/RegisterPage';
import ProfilePage from './pages/UserProfilePage';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerSummary from './pages/WorkerSummaryPage';
import BookingPage from './pages/BookingPage';
import UserBookingsPage from './pages/UserBookingDetailsPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

// Admin imports
import AdminLogin from './admin/AdminLogin';
import AdminRouteGuard from './admin/AdminRouteGuard';
import Dashboard from './admin/pages/DashboardOverview';
import Users from './admin/pages/UsersPage';
import Workers from './admin/pages/WorkersPage';
import Bookings from './admin/pages/BookingsPage';
import PaymentsPage from './admin/pages/PaymentsPage';



function App() {
  const location = useLocation();
  const hideLayout = ["/login", "/register", "/worker/dashboard", "/worker/summary"].includes(location.pathname) || 
                        ["/admin/login", "/admin/dashboard", "/admin/users", "/admin/workers", "/admin/bookings", "/admin/payments", "/admin/services", "/admin/test"].includes(location.pathname);

  // Get background color based on route
  const getBackgroundClass = () => {
    if (location.pathname.startsWith('/admin')) {
      return 'bg-green-50'; // Light green background for admin
    }
    return 'bg-green'; // Green background for main app
  };

  return (
    <>
      <ScrollToTop />
      <BackButton />
      {!hideLayout && <Navbar />} 
      <main className={`${getBackgroundClass()} min-h-screen`}>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/home" element={
            <WorkerRestrictedRoute>
              <Home />
            </WorkerRestrictedRoute>
          } />
          <Route path="/worker" element={
            <WorkerRestrictedRoute>
              <WorkerPage />
            </WorkerRestrictedRoute>
          } />
          <Route path="/blog" element={
            <WorkerRestrictedRoute>
              <BlogPage />
            </WorkerRestrictedRoute>
          } />
          <Route path="/about" element={
            <WorkerRestrictedRoute>
              <AboutPage />
            </WorkerRestrictedRoute>
          } />
          <Route path="/workers/:workerId" element={
            <WorkerRestrictedRoute>
              <WorkerDetails />
            </WorkerRestrictedRoute>
          } />
          <Route path="/contactus" element={
            <WorkerRestrictedRoute>
              <ContactUs />
            </WorkerRestrictedRoute>
          } />
          <Route path="/faqs" element={
            <WorkerRestrictedRoute>
              <FaqPage />
            </WorkerRestrictedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/me" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <ProfilePage />
            </RoleBasedRoute>
          } />
          <Route path="/worker/dashboard" element={
            <RoleBasedRoute allowedRoles={['worker']}>
              <WorkerDashboard />
            </RoleBasedRoute>
          } />
          <Route path="/worker/summary" element={
            <RoleBasedRoute allowedRoles={['worker']}>
              <WorkerSummary />
            </RoleBasedRoute>
          } />
          <Route path="/booking/:workerId" element={  
            <RoleBasedRoute allowedRoles={['user']}>
              <BookingPage />
            </RoleBasedRoute>} />

          <Route path="/booking/details" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <UserBookingsPage />
            </RoleBasedRoute>} />

          <Route path="/payment/success" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <PaymentSuccess />
            </RoleBasedRoute>} />
          <Route path="/payment/cancel" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <PaymentCancel />
            </RoleBasedRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminRouteGuard>
              <Dashboard />
            </AdminRouteGuard>
          } />
          <Route path="/admin/users" element={
            <AdminRouteGuard>
              <Users />
            </AdminRouteGuard>
          } />
          <Route path="/admin/workers" element={
            <AdminRouteGuard>
              <Workers />
            </AdminRouteGuard>
          } />
          <Route path="/admin/bookings" element={
            <AdminRouteGuard>
              <Bookings />
            </AdminRouteGuard>
          } />
          <Route path="/admin/payments" element={
            <AdminRouteGuard>
              <PaymentsPage />
            </AdminRouteGuard>
          } />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </>
  );
}

export default function RootApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

