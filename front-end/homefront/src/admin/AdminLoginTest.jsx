import React from 'react';

function AdminLogin() {
  return (
    <div style={{ 
      backgroundColor: '#f0f0f0', 
      padding: '20px', 
      color: '#333',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>Admin Login Test</h1>
        <p style={{ marginBottom: '20px' }}>This is a test to see if React components are working.</p>
        <button style={{ 
          backgroundColor: '#007bff', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Test Button
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;
