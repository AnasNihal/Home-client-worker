import React, { useState, useEffect } from 'react';
import { getAdminToken } from '../adminUtils';
import AdminLayout from '../components/AdminLayout';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDrawer, setShowUserDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const adminToken = getAdminToken();
        if (!adminToken) {
          setError('Please login first');
          setLoading(false);
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/superadmin/users/', {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
          setFilteredUsers(data.users || []);
        } else {
          setError('Failed to fetch users');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, users]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDrawer(true);
  };

  const handleSuspendUser = (user) => {
    // Implementation for suspending user

  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // Implementation for deleting user

    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const UserRow = ({ user }) => (
    <tr style={{ 
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #D1FAE5',
      transition: 'background-color 0.2s ease'
    }}>
      <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
        #{user.id}
      </td>
      <td style={{ padding: '16px' }}>
        <div style={{ color: '#064E3B', fontWeight: '600' }}>
          {user.username}
        </div>
        <div style={{ color: '#6B7280', fontSize: '12px' }}>
          {user.first_name} {user.last_name}
        </div>
      </td>
      <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
        {user.email}
      </td>
      <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
        {user.first_name || '-'}
      </td>
      <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
        {user.last_name || '-'}
      </td>
      <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
        {user.phone || '-'}
      </td>
      <td style={{ padding: '16px' }}>
        <span style={{ 
          backgroundColor: '#10B98120', 
          color: '#10B981', 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {user.total_bookings}
        </span>
      </td>
      <td style={{ padding: '16px' }}>
        <span style={{ 
          backgroundColor: user.is_active ? '#10B98120' : '#EF444420',
          color: user.is_active ? '#10B981' : '#EF4444', 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {user.is_active ? '✓ Active' : '✗ Inactive'}
        </span>
      </td>
      <td style={{ padding: '16px' }}>
        {new Date(user.date_joined).toLocaleDateString()}
      </td>
      <td style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleViewUser(user)}
            style={{
              backgroundColor: '#FCD34D',
              color: '#0C7C59',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#FDE68A'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#FCD34D'}
          >
            View Details
          </button>
          <button
            onClick={() => handleSuspendUser(user)}
            style={{
              backgroundColor: '#FCD34D',
              color: '#0C7C59',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#FDE68A'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#FCD34D'}
          >
            Suspend
          </button>
          <button
            onClick={() => handleDeleteUser(user)}
            style={{
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#DC2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#EF4444'}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #334155',
              borderTop: '4px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <div style={{ color: '#94A3B8' }}>Loading users...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px' 
        }}>
          <div style={{ 
            backgroundColor: '#1E293B', 
            border: '1px solid #334155', 
            borderRadius: '12px', 
            padding: '32px', 
            textAlign: 'center' 
          }}>
            <div style={{ color: '#EF4444', fontSize: '18px', marginBottom: '8px' }}>
              Error loading users
            </div>
            <div style={{ color: '#94A3B8' }}>{error}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#064E3B', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            Users Management
          </h1>
          <p style={{ color: '#6B7280', fontSize: '16px' }}>
            Showing regular users only (workers excluded)
          </p>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1FAE5',
                borderRadius: '8px',
                color: '#064E3B',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1FAE5',
              borderRadius: '8px',
              color: '#064E3B',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Users Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #D1FAE5',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#F0FDF4' }}>
              <tr>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#064E3B', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ID
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#064E3B', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Username
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#064E3B', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Email
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#064E3B', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  First Name
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#064E3B', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Last Name
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#064E3B', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Phone
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#064E3B', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Bookings
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#064E3B', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#064E3B', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Date Joined
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#064E3B', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map(user => <UserRow key={user.id} user={user} />)
              ) : (
                <tr>
                  <td colSpan="7" style={{ 
                    padding: '60px', 
                    textAlign: 'center', 
                    color: '#94A3B8' 
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                    <div>No users found</div>
                    <div style={{ fontSize: '14px', marginTop: '8px' }}>
                      Try adjusting your search or filters
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '24px'
          }}>
            <div style={{ color: '#94A3B8', fontSize: '14px' }}>
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === 1 ? '#334155' : '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: currentPage === 1 ? '#64748B' : 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: currentPage === page ? '#3B82F6' : '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === totalPages ? '#334155' : '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: currentPage === totalPages ? '#64748B' : 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* User Details Drawer */}
        {showUserDrawer && selectedUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            height: '100%',
            backgroundColor: '#1E293B',
            borderLeft: '1px solid #334155',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease'
          }}>
            <div style={{ padding: '24px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '24px' 
              }}>
                <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', margin: 0 }}>
                  User Details
                </h2>
                <button
                  onClick={() => setShowUserDrawer(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#334155',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ color: '#94A3B8', lineHeight: 1.6 }}>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Username:</strong> {selectedUser.username}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Email:</strong> {selectedUser.email}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Phone:</strong> {selectedUser.phone || 'N/A'}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Status:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    backgroundColor: selectedUser.is_active ? '#22C55E20' : '#EF444420',
                    color: selectedUser.is_active ? '#22C55E' : '#EF4444'
                  }}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Total Bookings:</strong> {selectedUser.total_bookings}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Joined:</strong> {new Date(selectedUser.date_joined).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Confirm Delete
              </h3>
              <p style={{ color: '#94A3B8', marginBottom: '24px' }}>
                Are you sure you want to delete user "{userToDelete.username}"? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#EF4444',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
