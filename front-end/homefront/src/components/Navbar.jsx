import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getAuthData } from "../utils/useHelper";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  // Get user data from localStorage
  const { user, token } = getAuthData();
  const [userProfile, setUserProfile] = useState(null);

  // Set user profile from localStorage
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.username || 'User',
        email: user.email || '',
        avatar: null,
        role: user.role || 'user',
      });
    } else {
      setUserProfile(null);
    }
  }, [user]);

  // Scroll behavior
  const prevScrollYRef = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
      setVisible(currentScrollY < prevScrollYRef.current || currentScrollY <= 100);
      prevScrollYRef.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMenuOpen(false);
  const closeProfileMenu = () => setIsProfileOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUserProfile(null);
    navigate("/login");
  };

  const initials = userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "U";

  const isAuthed = !!userProfile;

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ease-in-out ${
        visible ? "translate-y-0" : "-translate-y-full"
      } ${
        isScrolled
          ? "bg-green/90 backdrop-blur-sm shadow-lg"
          : "bg-green/70 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          <Link to="/" onClick={closeMobileMenu}>
            <div className="flex items-center gap-2 text-2xl font-bold text-primary">
              <img src="/images/OltonLogo.png" alt="Olton Logo" className="h-8 w-auto" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex">
            <ul className="flex gap-8 text-white font-medium">
              <li><Link to="/" className="hover:text-yellow-400 transition-colors duration-200">Home</Link></li>
              <li><Link to="/About" className="hover:text-yellow-400 transition-colors duration-200">About</Link></li>
              <li><Link to="/Worker" className="hover:text-yellow-400 transition-colors duration-200">Workers</Link></li>
              <li><Link to="/blog" className="hover:text-yellow-400 transition-colors duration-200">Blog</Link></li>
              <li><Link to="/contactus" className="hover:text-yellow-400 transition-colors duration-200">Contact</Link></li>
            </ul>
          </div>

          {/* Desktop Auth / Profile */}
          <div className="hidden lg:block relative">
            {isAuthed ? (
              <>
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full p-2 hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    {userProfile?.avatar ? (
                      <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold text-sm">{initials}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pr-2">
                    <span className="text-white font-medium text-sm">{userProfile.name}</span>
                    <svg className={`w-4 h-4 text-white transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        {userProfile?.avatar ? <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-white font-semibold">{initials}</span>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{userProfile.name}</p>
                        <p className="text-sm text-gray-600">{userProfile.email}</p>
                      </div>
                    </div>
                    <div className="py-2">
                      {userProfile?.role === "worker" ? (
                        <>
                          <Link to="/worker/dashboard" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeProfileMenu}>Worker Dashboard</Link>
                          <Link to="/worker/summary" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeProfileMenu}>Summary</Link>
                        </>
                      ) : (
                        <>
                          <Link to="/profile/me" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeProfileMenu}>Profile</Link>
                          <Link to="/booking/details" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeProfileMenu}>Booking Details</Link>
                        </>
                      )}
                      <button className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left" onClick={handleLogout}>Sign Out</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="text-white hover:text-yellow-400">Login</Link>
                <Link to="/register" className="text-white hover:text-yellow-400">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen((v) => !v)} className="text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400" aria-label="Toggle menu">
              <div className="relative w-6 h-6">
                <span className={`absolute block w-full h-0.5 bg-white transform transition-all duration-300 ${isMenuOpen ? "rotate-45 top-3" : "top-1"}`}></span>
                <span className={`absolute block w-full h-0.5 bg-white transform transition-all duration-300 top-3 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}></span>
                <span className={`absolute block w-full h-0.5 bg-white transform transition-all duration-300 ${isMenuOpen ? "-rotate-45 top-3" : "top-5"}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-green/95 backdrop-blur-sm border-t border-white/20">
            <div className="px-6 py-4">
              <ul className="space-y-3 text-white font-medium">
                <li><Link to="/" className="block hover:text-yellow-400 transition-colors duration-200" onClick={closeMobileMenu}>Home</Link></li>
                <li><Link to="/About" className="block hover:text-yellow-400 transition-colors duration-200" onClick={closeMobileMenu}>About</Link></li>
                <li><Link to="/Worker" className="block hover:text-yellow-400 transition-colors duration-200" onClick={closeMobileMenu}>Workers</Link></li>
                <li><Link to="/blog" className="block hover:text-yellow-400 transition-colors duration-200" onClick={closeMobileMenu}>Blog</Link></li>
                <li><Link to="/contactus" className="block hover:text-yellow-400 transition-colors duration-200" onClick={closeMobileMenu}>Contact</Link></li>
              </ul>
            </div>
            
            <div className="px-6 pb-4 border-b border-white/20 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  {isAuthed && userProfile?.avatar ? (
                    <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold text-lg">{initials}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{isAuthed ? userProfile.name : "Guest"}</p>
                  <p className="text-sm text-gray-300">{isAuthed ? userProfile.email : ""}</p>
                </div>
              </div>
            </div>

            {/* Mobile Auth Menu */}
            <div className="px-6 pb-6">
              {isAuthed ? (
                <div className="space-y-2">
                  {userProfile?.role === "worker" ? (
                    <>
                      <Link to="/worker/dashboard" className="block w-full text-left px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200 text-white" onClick={closeMobileMenu}>Worker Dashboard</Link>
                      <Link to="/worker/summary" className="block w-full text-left px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200 text-white" onClick={closeMobileMenu}>Summary</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/profile/me" className="block w-full text-left px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200 text-white" onClick={closeMobileMenu}>Profile</Link>
                      <Link to="/booking/details" className="block w-full text-left px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200 text-white" onClick={closeMobileMenu}>Booking Details</Link>
                    </>
                  )}
                  <button className="w-full text-left px-4 py-3 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors duration-200 text-red-300" onClick={handleLogout}>Sign Out</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block w-full text-center px-4 py-3 bg-yellow-400 text-green rounded-lg hover:bg-yellow-300 transition-colors duration-200 font-medium" onClick={closeMobileMenu}>Login</Link>
                  <Link to="/register" className="block w-full text-center px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 font-medium" onClick={closeMobileMenu}>Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
