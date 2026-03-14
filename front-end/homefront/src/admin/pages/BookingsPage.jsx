import React, { useState, useEffect } from 'react';
import { getAdminToken } from '../adminUtils';
import AdminLayout from '../components/AdminLayout';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const bookingsPerPage = 10;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const adminToken = getAdminToken();
        if (!adminToken) {
          setError('Please login first');
          setLoading(false);
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/superadmin/bookings/', {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBookings(data.bookings || []);
          setFilteredBookings(data.bookings || []);
        } else {
          setError('Failed to fetch bookings');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.id.toString().includes(searchTerm) ||
        booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.worker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => 
        booking.booking_status === statusFilter
      );
    }

    // Apply service filter
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(booking => 
        booking.service_name === serviceFilter
      );
    }

    // Apply date filter (simplified - could be enhanced with date range picker)
    if (dateFilter !== 'all') {
      const today = new Date();
      const filteredDate = new Date();
      
      switch(dateFilter) {
        case 'today':
          filteredDate.setDate(today.getDate());
          break;
        case 'week':
          filteredDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          filteredDate.setMonth(today.getMonth() - 1);
          break;
        default:
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(booking => 
          new Date(booking.created_at) >= filteredDate
        );
      }
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, serviceFilter, bookings]);

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleUpdateStatus = (booking, newStatus) => {
    // Implementation for updating booking status

  };

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    // Implementation for cancelling booking

    setShowCancelModal(false);
    setBookingToCancel(null);
  };

  const BookingRow = ({ booking }) => (
    <tr style={{ 
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #D1FAE5',
      transition: 'background-color 0.2s ease'
    }}>
      <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
        #{booking.id}
      </td>
      <td style={{ padding: '16px' }}>
        <div style={{ color: '#064E3B', fontWeight: '600' }}>
          {booking.user_name || 'N/A'}
        </div>
      </td>
      <td style={{ padding: '16px' }}>
        <div style={{ color: '#064E3B', fontWeight: '600' }}>
          {booking.worker_name || 'N/A'}
        </div>
      </td>
      <td style={{ padding: '16px' }}>
        <div style={{ color: '#6B7280', fontSize: '14px' }}>
          {booking.service_name || 'N/A'}
        </div>
      </td>
      <td style={{ padding: '16px' }}>
        <div style={{ color: '#6B7280', fontSize: '14px' }}>
          {booking.scheduled_date || 'N/A'}
        </div>
        <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
          {booking.scheduled_time || 'N/A'}
        </div>
      </td>
      <td style={{ padding: '16px' }}>
        <span style={{
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: 
            booking.booking_status === 'pending' ? '#FCD34D20' :
            booking.booking_status === 'confirmed' ? '#3B82F620' :
            booking.booking_status === 'in_progress' ? '#8B5CF620' :
            booking.booking_status === 'completed' ? '#10B98120' :
            booking.booking_status === 'cancelled' ? '#EF444420' : '#6B728020',
          color: 
            booking.booking_status === 'pending' ? '#FCD34D' :
            booking.booking_status === 'confirmed' ? '#3B82F6' :
            booking.booking_status === 'in_progress' ? '#8B5CF6' :
            booking.booking_status === 'completed' ? '#10B981' :
            booking.booking_status === 'cancelled' ? '#EF4444' : '#6B7280'
        }}>
          {booking.booking_status?.replace('_', ' ') || 'N/A'}
        </span>
      </td>
      <td style={{ padding: '16px' }}>
        <div style={{ color: '#064E3B', fontWeight: '600' }}>
          ₹{booking.total_amount || 0}
        </div>
        <div style={{ 
          fontSize: '12px',
          color: booking.payment_status === 'paid' ? '#10B981' : '#FCD34D'
        }}>
          {booking.payment_status || 'N/A'}
        </div>
      </td>
      <td style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleViewBooking(booking)}
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
          {booking.booking_status === 'pending' && (
            <button
              onClick={() => handleUpdateStatus(booking, 'confirmed')}
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
              Confirm
            </button>
          )}
          {booking.booking_status === 'confirmed' && (
            <button
              onClick={() => handleUpdateStatus(booking, 'in_progress')}
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
              Start
            </button>
          )}
          {booking.booking_status === 'in_progress' && (
            <button
              onClick={() => handleUpdateStatus(booking, 'completed')}
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
              Complete
            </button>
          )}
          {(booking.booking_status === 'pending' || booking.booking_status === 'confirmed') && (
            <button
              onClick={() => handleCancelBooking(booking)}
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
              Cancel
            </button>
          )}
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
            <div style={{ color: '#94A3B8' }}>Loading bookings...</div>
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
              Error loading bookings
            </div>
            <div style={{ color: '#94A3B8' }}>{error}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Get unique services for filter
  const services = [...new Set(bookings.map(b => b.service_name).filter(Boolean))];
  const statusOptions = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            Bookings Management
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '16px' }}>
            Manage all service bookings and their status
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
              placeholder="Search by booking ID, customer, or worker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: 'white',
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
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            <option value="all">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
              </option>
            ))}
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            <option value="all">All Services</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Bookings Table */}
        <div style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#0F172A' }}>
              <tr>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#94A3B8', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Booking ID
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#94A3B8', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Customer
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#94A3B8', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Worker
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#94A3B8', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Service
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#94A3B8', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Date & Time
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#94A3B8', 
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
                  color: '#94A3B8', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Amount
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  color: '#94A3B8', 
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
              {currentBookings.length > 0 ? (
                currentBookings.map(booking => <BookingRow key={booking.id} booking={booking} />)
              ) : (
                <tr>
                  <td colSpan="8" style={{ 
                    padding: '60px', 
                    textAlign: 'center', 
                    color: '#94A3B8' 
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                    <div>No bookings found</div>
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
              Showing {indexOfFirstBooking + 1} to {Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} bookings
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

        {/* Booking Details Modal */}
        {showBookingModal && selectedBooking && (
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
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '24px' 
              }}>
                <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', margin: 0 }}>
                  Booking Details
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
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
                  <strong style={{ color: 'white' }}>Booking ID:</strong> #{selectedBooking.id}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Customer:</strong> {selectedBooking.user_name || 'N/A'}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Worker:</strong> {selectedBooking.worker_name || 'N/A'}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Service:</strong> {selectedBooking.service_name || 'N/A'}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Scheduled Date:</strong> {selectedBooking.scheduled_date || 'N/A'}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Scheduled Time:</strong> {selectedBooking.scheduled_time || 'N/A'}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Status:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    backgroundColor: 
                      selectedBooking.booking_status === 'pending' ? '#F59E0B20' :
                      selectedBooking.booking_status === 'confirmed' ? '#3B82F620' :
                      selectedBooking.booking_status === 'in_progress' ? '#8B5CF620' :
                      selectedBooking.booking_status === 'completed' ? '#22C55E20' :
                      selectedBooking.booking_status === 'cancelled' ? '#EF444420' : '#6B728020',
                    color: 
                      selectedBooking.booking_status === 'pending' ? '#F59E0B' :
                      selectedBooking.booking_status === 'confirmed' ? '#3B82F6' :
                      selectedBooking.booking_status === 'in_progress' ? '#8B5CF6' :
                      selectedBooking.booking_status === 'completed' ? '#22C55E' :
                      selectedBooking.booking_status === 'cancelled' ? '#EF4444' : '#6B7280'
                  }}>
                    {selectedBooking.booking_status?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Payment Status:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    backgroundColor: 
                      selectedBooking.payment_status === 'paid' ? '#22C55E20' :
                      selectedBooking.payment_status === 'pending' ? '#F59E0B20' :
                      selectedBooking.payment_status === 'refunded' ? '#3B82F620' :
                      selectedBooking.payment_status === 'failed' ? '#EF444420' : '#6B728020',
                    color: 
                      selectedBooking.payment_status === 'paid' ? '#22C55E' :
                      selectedBooking.payment_status === 'pending' ? '#F59E0B' :
                      selectedBooking.payment_status === 'refunded' ? '#3B82F6' :
                      selectedBooking.payment_status === 'failed' ? '#EF4444' : '#6B7280'
                  }}>
                    {selectedBooking.payment_status || 'N/A'}
                  </span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Total Amount:</strong> ₹{selectedBooking.total_amount || 0}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'white' }}>Created:</strong> {new Date(selectedBooking.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && bookingToCancel && (
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
                Confirm Cancellation
              </h3>
              <p style={{ color: '#94A3B8', marginBottom: '24px' }}>
                Are you sure you want to cancel booking #{bookingToCancel.id}? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCancelModal(false)}
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
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancel}
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
                  Cancel Booking
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
        `}</style>
      </div>
    </AdminLayout>
  );
};

export default BookingsPage;
