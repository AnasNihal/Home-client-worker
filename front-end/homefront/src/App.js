  import React, { useEffect } from 'react';
  import { fetchAPI } from "./utils/api";
  import { BrowserRouter , Routes, Route , useLocation} from 'react-router-dom';
  import ScrollToTop from "./ScrollToTop"; 
  import PrivateRoute from './utils/PrivateRoute';
  import Navbar from "./components/Navbar";
  import WorkerPage from './pages/WorkerPage';
  import Home from "./pages/Home";
  import Footer from './components/Footer';
  import AboutPage from './pages/AboutPage';
  import WorkerDetails from './pages/WorkerDetails';
  import BlogPage from './pages/BlogPage';
  import Login from './pages/LoginPage';  
  import Register from './pages/RegisterPage';
  import ProfilePage from './pages/UserProfilePage';
  import WorkerDashboard from './pages/WorkerDashboard';
  import WorkerSummary from './pages/WorkerSummaryPage';
  import BookingPage from './pages/BookingPage';
  import UserBookingsPage from './pages/UserBookingDetailsPage';



function App() {
  const location = useLocation();
  const hideLayout = ["/login", "/register"].includes(location.pathname);

    useEffect(() => {
    // Wake up Neon / backend as soon as app loads
    fetchAPI("/ping/").catch(() => {
      console.log("Backend warm-up done");
    });
  }, []);
  

  return (
    <>
      <ScrollToTop />
      {!hideLayout && <Navbar />} 
      <main className="bg-green min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/worker" element={<WorkerPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/workers/:workerId" element={<WorkerDetails />} />
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

