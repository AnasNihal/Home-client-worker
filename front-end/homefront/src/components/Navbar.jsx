
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [visible, setVisible] = useState(true);

  // Handle scroll behavior - hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Set scrolled state for styling
      setIsScrolled(currentScrollY > 10);

      // Hide/show navbar based on scroll direction
      if (currentScrollY > prevScrollY && currentScrollY > 100) {
        setVisible(false); // Hide when scrolling down
      } else {
        setVisible(true); // Show when scrolling up
      }

      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY]);

  // Close mobile menu when clicking outside or on link
  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  // Close profile dropdown when clicking outside
  const closeProfileMenu = () => {
    setIsProfileOpen(false);
  };

  // Sample user data - you can replace this with real user data
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZL2x8c5bhW6zpUl27Azyq40A3fvsXnvtkQw&s" // You can use a default avatar or user's profile pic
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ease-in-out ${
      visible ? 'translate-y-0' : '-translate-y-full'
    } ${isScrolled ? 'bg-green/90 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">

          {/* Logo - Always visible */}
         <Link to='/'> 
          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
            <img 

              src="/images/OltonLogo.png" 
              alt="Olton Logo" 
              className="h-8 w-auto"
            />
          </div>
          </Link> 
          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <div className="hidden lg:flex">
            <ul className="flex gap-8 text-white font-medium">
              <li>
                <Link to="/" className="hover:text-yellow-400 cursor-pointer transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/About" className="hover:text-yellow-400 cursor-pointer transition-colors duration-200">
                  About
                </Link>
              </li>
              <li>
                <Link to="/Worker" className="hover:text-yellow-400 cursor-pointer transition-colors duration-200">
                  Workers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-yellow-400 cursor-pointer transition-colors duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contactus" className="hover:text-yellow-400 cursor-pointer transition-colors duration-200">
                  Contact 
                </Link>
              </li>
            </ul>
          </div>

          {/* Desktop User Profile - Hidden on mobile/tablet */}
          <div className="hidden lg:block relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full p-2 hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                )}
              </div>

              {/* User Name & Arrow */}
              <div className="flex items-center gap-2 pr-2">
                <span className="text-white font-medium text-sm">{user.name}</span>
                <svg 
                  className={`w-4 h-4 text-white transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Desktop Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Menu Items */}
                <div className="py-2">
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200" onClick={closeProfileMenu}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200" onClick={closeProfileMenu}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <button className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left" onClick={closeProfileMenu}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Visible on mobile/tablet */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute block w-full h-0.5 bg-white transform transition-all duration-300 ease-in-out ${
                  isMenuOpen ? 'rotate-45 top-3' : 'top-1'
                }`}></span>
                <span className={`absolute block w-full h-0.5 bg-white transform transition-all duration-300 ease-in-out top-3 ${
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`absolute block w-full h-0.5 bg-white transform transition-all duration-300 ease-in-out ${
                  isMenuOpen ? '-rotate-45 top-3' : 'top-5'
                }`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 bg-black/95 backdrop-blur-sm rounded-lg mx-2 mb-4">
            {/* Mobile User Profile Section */}
            <div className="px-6 pb-4 border-b border-white/20 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold text-lg">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-sm text-gray-300">{user.email}</p>
                </div>
              </div>
            </div>

            <ul className="flex flex-col space-y-4 px-6">
              <li>
                <Link 
                  to="/" 
                  className="block text-white hover:text-yellow-400 cursor-pointer transition-colors duration-200 py-2"
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/About" 
                  className="block text-white hover:text-yellow-400 cursor-pointer transition-colors duration-200 py-2"
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/Service" 
                  className="block text-white hover:text-yellow-400 cursor-pointer transition-colors duration-200 py-2"
                  onClick={closeMobileMenu}
                >
                  Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="block text-white hover:text-yellow-400 cursor-pointer transition-colors duration-200 py-2"
                  onClick={closeMobileMenu}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  to="/contactus" 
                  className="block text-white hover:text-yellow-400 cursor-pointer transition-colors duration-200 py-2"
                  onClick={closeMobileMenu}
                >
                  Contact 
                </Link>
              </li>
            </ul>

            {/* Mobile Profile Menu Items */}
            <div className="px-6 pt-4 border-t border-white/20 mt-4">
              <div className="space-y-2">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 text-white hover:text-yellow-400 cursor-pointer transition-colors duration-200 py-2"
                  onClick={closeMobileMenu}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="flex items-center gap-3 text-white hover:text-yellow-400 cursor-pointer transition-colors duration-200 py-2"
                  onClick={closeMobileMenu}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <button 
                  className="flex items-center gap-3 text-red-400 hover:text-red-300 cursor-pointer transition-colors duration-200 py-2 w-full text-left"
                  onClick={closeMobileMenu}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Overlay for desktop profile dropdown */}
      {isProfileOpen && (
        <div 
          className="hidden lg:block fixed inset-0 -z-10"
          onClick={closeProfileMenu}
        ></div>
      )}
    </nav>
  );
}