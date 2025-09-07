import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [visible, setVisible] = useState(true);

  // Dynamic user from backend
  const [user, setUser] = useState(null); // { name, email, avatar, role } | null
  const [userLoading, setUserLoading] = useState(true);

  // Track token & role in state
  const [token, setToken] = useState(localStorage.getItem("access"));
  const [role, setRole] = useState(localStorage.getItem("role") || null);

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

  // Listen for token/role changes in other tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "access") setToken(e.newValue);
      if (e.key === "role") setRole(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const closeMobileMenu = () => setIsMenuOpen(false);
  const closeProfileMenu = () => setIsProfileOpen(false);

  // Fetch profile
  useEffect(() => {
    let alive = true;

    const fetchProfile = async (endpoint) => {
      const res = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("fetch failed");
      return await res.json();
    };

    const load = async () => {
      setUserLoading(true);
      if (!token) {
        if (alive) {
          setUser(null);
          setUserLoading(false);
          setRole(localStorage.getItem("role") || null);
        }
        return;
      }

      try {
        const storedRole = localStorage.getItem("role") || role;
        if (storedRole) {
          const endpoint =
            storedRole === "worker"
              ? "http://127.0.0.1:8000/worker/dashboard"
              : "http://127.0.0.1:8000/user/profile";
          const data = await fetchProfile(endpoint);

          const normalized =
            storedRole === "worker"
              ? {
                  name: data.name || data.username || "Worker",
                  email: data.email || "",
                  avatar: data.image || "",
                  role: "worker",
                }
              : {
                  name:
                    `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
                    data.username ||
                    "User",
                  email: data.email || "",
                  avatar: data.profileimage || "",
                  role: "user",
                };

          if (alive) {
            setUser(normalized);
            setRole(normalized.role);
            localStorage.setItem("role", normalized.role);
          }
          return;
        }

        // If no stored role, try user first
        try {
          const data = await fetchProfile("http://127.0.0.1:8000/user/profile");
          if (alive) {
            setUser({
              name:
                `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
                data.username ||
                "User",
              email: data.email || "",
              avatar: data.profileimage || "",
              role: "user",
            });
            setRole("user");
            localStorage.setItem("role", "user");
          }
          return;
        } catch (errUser) {
          // try worker
        }

        try {
          const data = await fetchProfile("http://127.0.0.1:8000/worker/dashboard");
          if (alive) {
            setUser({
              name: data.name || data.username || "Worker",
              email: data.email || "",
              avatar: data.image || "",
              role: "worker",
            });
            setRole("worker");
            localStorage.setItem("role", "worker");
          }
          return;
        } catch (errWorker) {
          if (alive) {
            setUser(null);
            setRole(null);
            localStorage.removeItem("role");
          }
        }
      } catch (err) {
        if (alive) {
          setUser(null);
          setRole(null);
          localStorage.removeItem("role");
        }
      } finally {
        if (alive) setUserLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [token, role]);

  const initials = (u) =>
    (u?.name
      ? u.name
          .split(" ")
          .map((n) => n[0])
          .join("")
      : "G"
    ).toUpperCase();

  const isAuthed = !!user;

  function handleLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
    setUser(null);
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  }

  return (
<nav
  className={`fixed w-full top-0 z-50 transition-all duration-300 ease-in-out ${
    visible ? "translate-y-0" : "-translate-y-full"
  } ${
    isScrolled
      ? "bg-green/90 backdrop-blur-sm shadow-lg"
      : "bg-green/50 backdrop-blur-sm"
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
                  disabled={userLoading}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold text-sm">{userLoading ? "…" : initials(user)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pr-2">
                    <span className="text-white font-medium text-sm">{userLoading ? "Loading…" : user.name}</span>
                    <svg className={`w-4 h-4 text-white transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-white font-semibold">{initials(user)}</span>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="py-2">
                      {user?.role === "worker" ? (
                        <>
                          <Link to="/worker/dashboard" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeProfileMenu}>Worker Dashboard</Link>
                          <Link to="" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeProfileMenu}>Summary</Link>
                        </>
                      ) : (
                        <>
                          <Link to="/profile/me" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeProfileMenu}>Profile</Link>
                          <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeProfileMenu}>Settings</Link>
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

        {/* Mobile Dropdown */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="py-4 bg-black/95 backdrop-blur-sm rounded-lg mx-2 mb-4">
            {/* Mobile User */}
            <div className="px-6 pb-4 border-b border-white/20 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  {isAuthed && user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold text-lg">{userLoading ? "…" : initials(user)}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{userLoading ? "Loading…" : isAuthed ? user.name : "Guest"}</p>
                  <p className="text-sm text-gray-300">{isAuthed ? user.email : ""}</p>
                </div>
              </div>
            </div>

            {/* Mobile Links */}
            <ul className="flex flex-col space-y-4 px-6">
              <li><Link to="/" className="block text-white hover:text-yellow-400 py-2" onClick={closeMobileMenu}>Home</Link></li>
              <li><Link to="/About" className="block text-white hover:text-yellow-400 py-2" onClick={closeMobileMenu}>About</Link></li>
              <li><Link to="/Worker" className="block text-white hover:text-yellow-400 py-2" onClick={closeMobileMenu}>Workers</Link></li>
              <li><Link to="/blog" className="block text-white hover:text-yellow-400 py-2" onClick={closeMobileMenu}>Blog</Link></li>
              <li><Link to="/contactus" className="block text-white hover:text-yellow-400 py-2" onClick={closeMobileMenu}>Contact</Link></li>
            </ul>

            {/* Mobile Profile Menu */}
            <div className="px-6 pt-4 border-t border-white/20 mt-4">
              <div className="space-y-2">
                {isAuthed ? (
                  <>
                    {user?.role === "worker" ? (
                      <>
                        <Link to="/worker/dashboard" className="flex items-center gap-3 text-white hover:text-yellow-400 py-2" onClick={closeMobileMenu}>Worker Dashboard</Link>
                        <Link to="/worker/bookings" className="flex items-center gap-3 text-white hover:text-yellow-400 py-2" onClick={closeMobileMenu}>Booking Details</Link>
                      </>
                    ) : (
                      <>
                        <Link to="/profile/me" className="flex items-center gap-3 text-white hover:text-yellow-400 py-2" onClick={closeMobileMenu}>Profile</Link>
                        <Link to="/settings" className="flex items-center gap-3 text-white hover:text-yellow-400 py-2" onClick={closeMobileMenu}>Settings</Link>
                      </>
                    )}

                    <button className="flex items-center gap-3 text-red-400 hover:text-red-300 py-2 w-full text-left" onClick={() => { handleLogout(); closeMobileMenu(); }}>Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-3 text-white hover:text-yellow-400 py-2" onClick={closeMobileMenu}>Login</Link>
                    <Link to="/register" className="flex items-center gap-3 text-white hover:text-yellow-400 py-2" onClick={closeMobileMenu}>Register</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {isMenuOpen && <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={closeMobileMenu} />}
      {isProfileOpen && <div className="hidden lg:block fixed inset-0 z-40" onClick={closeProfileMenu} />}
    </nav>
  );
}
