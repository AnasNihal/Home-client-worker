  import React from 'react';
  import { BrowserRouter , Routes, Route } from 'react-router-dom';
  import ScrollToTop from "./ScrollToTop"; 


  import Navbar from "./components/Navbar";
  import WorkerPage from './pages/WorkerPage';
  import Home from "./pages/Home";
  import Footer from './components/Footer';
  import AboutPage from './pages/AboutPage';
  import BookingPage from './pages/BookingPage';
  import ServiceDetails from './pages/WorkerDetails';
  import ContactUs from './pages/contactus';
import BlogPage from './pages/BlogPage';


  function App() {
    return (
      <BrowserRouter>
      <ScrollToTop />
        <Navbar/>
        <main className="bg-green min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />         {/* Your Home page */}
            <Route path="/worker" element={<WorkerPage />} /> 
            <Route path="/blog" element={<BlogPage/>} /> 
            <Route path="/About" element={<AboutPage/>} /> 
             <Route path="/booking" element={<BookingPage/>} /> 
             <Route path="/worker-details/:workerId" element={<ServiceDetails />} />
             <Route path="/contactus" element={<ContactUs/>}/>

          </Routes>
        </main>
        <Footer/>
        </BrowserRouter>
    );
  }

  export default App;

