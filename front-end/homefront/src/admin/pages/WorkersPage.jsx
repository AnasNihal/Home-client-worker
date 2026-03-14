import React, { useState, useEffect } from 'react';
import { getAdminToken } from '../adminUtils';
import AdminLayout from '../components/AdminLayout';

const WorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showWorkerDrawer, setShowWorkerDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState(null);

  const workersPerPage = 10;

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const adminToken = getAdminToken();
        if (!adminToken) {
          setError('Please login first');
          setLoading(false);
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/superadmin/workers/', {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setWorkers(data.workers || []);
          setFilteredWorkers(data.workers || []);
        } else {
          setError('Failed to fetch workers');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  useEffect(() => {
    let filtered = workers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (worker.category && worker.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(worker => 
        statusFilter === 'active' ? worker.is_available : !worker.is_available
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(worker => 
        worker.category === categoryFilter
      );
    }

    setFilteredWorkers(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, workers]);

  const indexOfLastWorker = currentPage * workersPerPage;
  const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
  const currentWorkers = filteredWorkers.slice(indexOfFirstWorker, indexOfLastWorker);
  const totalPages = Math.ceil(filteredWorkers.length / workersPerPage);

  const handleViewWorker = (worker) => {
    setSelectedWorker(worker);
    setShowWorkerDrawer(true);
  };

  const handleApproveWorker = (worker) => {
    // Implementation for approving worker

  };

  const handleSuspendWorker = (worker) => {
    // Implementation for suspending worker

  };

  const handleRemoveBadge = (worker) => {
    // Implementation for removing worker badge

  };



  const confirmDelete = () => {
    // Implementation for deleting worker

    setShowDeleteModal(false);
    setWorkerToDelete(null);
  };

  const WorkerRow = ({ worker }) => (
    <tr style={{ 
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #D1FAE5',
      transition: 'background-color 0.2s ease'
    }}>
      <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
        #{worker.id}
      </td>
      <td style={{ padding: '16px' }}>
        <div style={{ color: '#064E3B', fontWeight: '600' }}>
          {worker.name}
        </div>
        <div style={{ color: '#6B7280', fontSize: '12px' }}>
          @{worker.username}
        </div>
      </td>
      <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
        {worker.email}
      </td>
      <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
        {worker.phone || 'N/A'}
      </td>
      <td style={{ padding: '16px' }}>
        <span style={{
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: '#C6DE4120',
          color: '#C6DE41'
        }}>
          {worker.category || 'N/A'}
        </span>
      </td>
      <td style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#FCD34D', fontSize: '16px' }}>⭐</span>
          <span style={{ color: '#064E3B', fontWeight: '600' }}>
            {worker.rating || '0.0'}
          </span>
        </div>
      </td>
      <td style={{ padding: '16px' }}>
        <span style={{
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: worker.is_available ? '#10B98120' : '#EF444420',
          color: worker.is_available ? '#10B981' : '#EF4444'
        }}>
          {worker.is_available ? 'Available' : 'Busy'}
        </span>
      </td>
      <td style={{ padding: '16px' }}>
        <span style={{
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: '#3B82F620',
          color: '#3B82F6'
        }}>
          {worker.booking_count || 0} bookings
        </span>
      </td>
      <td style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleViewWorker(worker)}
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
            View Profile
          </button>
          <button
            onClick={() => handleApproveWorker(worker)}
            style={{
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10B981'}
          >
            Approve
          </button>
          <button
            onClick={() => handleSuspendWorker(worker)}
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
            onClick={() => handleRemoveBadge(worker)}
            style={{
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#7C3AED'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#8B5CF6'}
          >
            Remove Badge
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
            <div style={{ color: '#94A3B8' }}>Loading workers...</div>
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
              Error loading workers
            </div>
            <div style={{ color: '#94A3B8' }}>{error}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Get unique categories for filter
  const categories = [...new Set(workers.map(w => w.category).filter(Boolean))];

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#064E3B', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            Workers Management
          </h1>
          <p style={{ color: '#6B7280', fontSize: '16px' }}>
            Manage service providers and their profiles
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
              placeholder="Search by name, email, or category..."
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
            <option value="active">Available</option>
            <option value="busy">Busy</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Workers Table */}
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
                  Name
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
                  Category
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
                  Rating
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentWorkers.length > 0 ? (
                currentWorkers.map(worker => <WorkerRow key={worker.id} worker={worker} />)
              ) : (
                <tr>
                  <td colSpan="9" style={{ 
                    padding: '60px', 
                    textAlign: 'center', 
                    color: '#94A3B8' 
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔧</div>
                    <div>No workers found</div>
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
              Showing {indexOfFirstWorker + 1} to {Math.min(indexOfLastWorker, filteredWorkers.length)} of {filteredWorkers.length} workers
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

        {/* Worker Profile Drawer */}
        {showWorkerDrawer && selectedWorker && (
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
                  Worker Profile
                </h2>
                <button
                  onClick={() => setShowWorkerDrawer(false)}
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
                  <strong style={{ color: 'white' }}>Name:</strong> {selectedWorker.name}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Username:</strong> @{selectedWorker.username}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Email:</strong> {selectedWorker.email}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Phone:</strong> {selectedWorker.phone || 'N/A'}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Category:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    backgroundColor: '#8B5CF620',
                    color: '#8B5CF6'
                  }}>
                    {selectedWorker.category || 'N/A'}
                  </span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Rating:</strong> 
                  <span style={{ marginLeft: '8px', color: '#F59E0B' }}>
                    ⭐ {selectedWorker.rating || '0.0'}
                  </span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Status:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    backgroundColor: selectedWorker.is_available ? '#22C55E20' : '#EF444420',
                    color: selectedWorker.is_available ? '#22C55E' : '#EF4444'
                  }}>
                    {selectedWorker.is_available ? 'Available' : 'Busy'}
                  </span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Location:</strong> {selectedWorker.location || 'N/A'}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Experience:</strong> {selectedWorker.experience || 'N/A'}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Total Bookings:</strong> {selectedWorker.booking_count || 0}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Stripe Onboarded:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    backgroundColor: selectedWorker.stripe_onboarded ? '#22C55E20' : '#EF444420',
                    color: selectedWorker.stripe_onboarded ? '#22C55E' : '#EF4444'
                  }}>
                    {selectedWorker.stripe_onboarded ? 'Yes' : 'No'}
                  </span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Joined:</strong> {new Date(selectedWorker.date_joined).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && workerToDelete && (
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
                Are you sure you want to delete worker "{workerToDelete.name}"? This action cannot be undone.
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

export default WorkersPage;
