  import React from 'react';
import { BrowserRouter , Routes, Route , useLocation} from 'react-router-dom';
import ScrollToTop from "./ScrollToTop"; 
import PrivateRoute from './utlis/PrivateRoute';
import WorkerRestrictedRoute from './components/WorkerRestrictedRoute';
import AdminRestrictedRoute from './components/AdminRestrictedRoute';
import Navbar from "./components/Navbar";
import WorkerPage from './pages/WorkerPage';
import Home from "./pages/Home";
import Footer from './components/Footer';
import AboutPage from './pages/AboutPage';
import WorkerDetails from './pages/WorkerDetails';
import ContactUs from './pages/ContactUs';
import BlogPage from './pages/BlogPage';
import Login from './pages/LoginPage';  
import Register from './pages/RegisterPage';
import ProfilePage from './pages/UserProfilePage';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerSummary from './pages/WorkerSummaryPage';
import BookingPage from './pages/BookingPage';
import UserBookingsPage from './pages/UserBookingDetailsPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';


function App() {
  const location = useLocation();
  const hideLayout = ["/login", "/register", "/worker/dashboard", "/worker/summary"].includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      {!hideLayout && <Navbar />} 
      <main className="bg-green min-h-screen">
        <Routes>
          <Route path="/" element={
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="profile/me" element={
            <PrivateRoute role='user'>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/worker/dashboard" element={
            <PrivateRoute role='worker'>
              <WorkerDashboard />
            </PrivateRoute>
          } />
          <Route path="/worker/summary" element={
            <PrivateRoute>
            <WorkerSummary role='worker'/>
            </PrivateRoute>
            } />
          <Route path="/booking/:workerId" element={  
             <PrivateRoute>
            <BookingPage role='user'/>
            </PrivateRoute>} />

          <Route path="/booking/details" element={<PrivateRoute>
            <UserBookingsPage role='user'/>
            </PrivateRoute>} />

          <Route path="/payment/success" element={<PrivateRoute>
            <PaymentSuccess role='user'/>
          </PrivateRoute>} />
          <Route path="/payment/cancel" element={<PrivateRoute>
            <PaymentCancel role='user'/>
          </PrivateRoute>} />

          

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

