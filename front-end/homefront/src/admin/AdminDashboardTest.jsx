import React from 'react';

function AdminDashboardTest() {
  return (
    <div style={{ 
      backgroundColor: '#e3f2fd', 
      padding: '20px', 
      color: '#333',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#1976d2', marginBottom: '20px' }}>Admin Dashboard Test</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1976d2', marginBottom: '10px' }}>Total Users</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>10</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#388e3c', marginBottom: '10px' }}>Total Workers</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>3</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#f57c00', marginBottom: '10px' }}>Total Bookings</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>12</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#7b1fa2', marginBottom: '10px' }}>Total Revenue</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>₹1,322</p>
        </div>
      </div>
      <p style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
        This is a simple admin dashboard test with inline styles to verify the components are working properly.
      </p>
    </div>
  );
}

export default AdminDashboardTest;
