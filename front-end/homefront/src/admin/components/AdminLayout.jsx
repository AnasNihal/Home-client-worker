import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const adminToken = sessionStorage.getItem('adminToken');
    if (adminToken) {
      // Parse token to get admin info (simplified)
      const adminUser = JSON.parse(sessionStorage.getItem('adminUser') || '{}');
      setAdminData(adminUser);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminRefresh');
    sessionStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/workers', label: 'Workers', icon: '🔧' },
    { path: '/admin/bookings', label: 'Bookings', icon: '📅' },
    { path: '/admin/payments', label: 'Payments', icon: '💳' },
  ];

  const getPageTitle = () => {
    const currentPath = menuItems.find(item => item.path === location.pathname);
    return currentPath ? currentPath.label : 'Admin Dashboard';
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: '#F0FDF4',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '80px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #D1FAE5',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 4px rgba(0,0,0,0.05)'
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #D1FAE5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'flex-start' : 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#FCD34D',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0C7C59',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            H
          </div>
          {sidebarOpen && (
            <span style={{ 
              marginLeft: '12px', 
              color: '#064E3B', 
              fontSize: '18px', 
              fontWeight: '600' 
            }}>
              HomeService
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  padding: sidebarOpen ? '12px 24px' : '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  color: isActive ? '#0C7C59' : '#6B7280',
                  backgroundColor: isActive ? '#ECFDF5' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderLeft: isActive ? '3px solid #FCD34D' : '3px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = '#F0FDF4';
                    e.target.style.color = '#065F46';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6B7280';
                  }
                }}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                {sidebarOpen && (
                  <span style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '500' }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Profile */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #D1FAE5',
          borderBottom: '1px solid #D1FAE5'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#FCD34D',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0C7C59',
              fontWeight: 'bold'
            }}>
              A
            </div>
            {sidebarOpen && (
              <div style={{ marginLeft: '12px', flex: 1 }}>
                <div style={{ color: '#064E3B', fontSize: '14px', fontWeight: '600' }}>
                  {adminData?.name || 'Admin'}
                </div>
                <div style={{ color: '#6B7280', fontSize: '12px' }}>
                  {adminData?.email || 'admin@homeservice.com'}
                </div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '8px',
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#DC2626'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#EF4444'}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{
          height: '72px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #D1FAE5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #D1FAE5',
                borderRadius: '8px',
                color: '#6B7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#D1FAE5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#F0FDF4'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
            <h1 style={{ 
              color: '#064E3B', 
              fontSize: '20px', 
              fontWeight: '600', 
              margin: 0 
            }}>
              {getPageTitle()}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Search Bar */}
            <div style={{
              position: 'relative',
              width: '300px'
            }}>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #D1FAE5',
                  borderRadius: '8px',
                  color: '#064E3B',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <svg
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF'
                }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>

            {/* Notifications */}
            <button style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #D1FAE5',
              borderRadius: '8px',
              color: '#6B7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#D1FAE5'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#F0FDF4'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                backgroundColor: '#EF4444',
                borderRadius: '50%'
              }}></div>
            </button>

            {/* Admin Avatar */}
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#FCD34D',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0C7C59',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ 
          flex: 1, 
          overflow: 'auto', 
          padding: '32px',
          backgroundColor: '#F0FDF4'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
