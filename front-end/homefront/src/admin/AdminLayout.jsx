import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefresh');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/admin/dashboard' },
    { name: 'Users', icon: '👥', path: '/admin/users' },
    { name: 'Workers', icon: '🔧', path: '/admin/workers' },
    { name: 'Bookings', icon: '📅', path: '/admin/bookings' },
    { name: 'Services', icon: '⚙️', path: '/admin/services' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-blue-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-900 transition-all duration-300 ease-in-out flex-shrink-0`}>
        <div className="flex flex-col h-full">
          {/* Top section with admin info */}
          <div className="flex items-center justify-center h-16 bg-indigo-800 border-b border-indigo-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white">👤</span>
              </div>
              {sidebarOpen && (
                <div className="text-white">
                  <div className="font-semibold">Super Admin</div>
                  <div className="text-xs text-slate-400">{adminUser.email || 'admin@example.com'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                }`}
              >
                <span className="h-5 w-5">{item.icon}</span>
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            ))}
          </nav>

          {/* Bottom section with logout */}
          <div className="border-t border-indigo-700 p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-indigo-200 hover:bg-red-600 hover:text-white transition-colors duration-200"
            >
              <span className="h-5 w-5">🚪</span>
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-indigo-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-indigo-900 capitalize">
              {menuItems.find(item => isActive(item.path))?.name || 'Dashboard'}
            </h1>
            
            <div className="flex items-center gap-4">
              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 bg-indigo-50 border border-indigo-300 rounded-lg py-2 pl-10 pr-4 text-sm text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="h-5 w-5 text-indigo-400">🔍</span>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-indigo-600 hover:text-indigo-900 transition-colors duration-200">
                <span className="h-6 w-6">🔔</span>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white">👤</span>
                  </div>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-blue-50">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
