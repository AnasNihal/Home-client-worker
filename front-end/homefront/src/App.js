  import React from 'react';
  import { BrowserRouter , Routes, Route , useLocation} from 'react-router-dom';
  import ScrollToTop from "./ScrollToTop"; 


  import Navbar from "./components/Navbar";
  import WorkerPage from './pages/WorkerPage';
  import Home from "./pages/Home";
  import Footer from './components/Footer';
  import AboutPage from './pages/AboutPage';
  import BookingPage from './pages/BookingPage';
  import WorkerDetails from './pages/WorkerDetails';
  import ContactUs from './pages/contactus';
  import BlogPage from './pages/BlogPage';
  import Login from './pages/LoginPage';  
  import Register from './pages/RegisterPage';
  import ProfilePage from './pages/UserProfilePage';

function App() {
  const location = useLocation();
  const hideLayout = ["/login", "/register"].includes(location.pathname);

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
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/workers/:workerId" element={<WorkerDetails />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/me" element={<ProfilePage />} />
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

