import React, { useState, useEffect } from 'react';
import { getAdminToken } from '../adminUtils';
import AdminLayout from '../components/AdminLayout';

const DashboardOverview = () => {
  const [stats, setStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const adminToken = getAdminToken();
        if (!adminToken) {
          setError('Please login first');
          setLoading(false);
          return;
        }

        // Fetch all data in parallel
        const [statsResponse, bookingsResponse, paymentsResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/superadmin/stats/', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          }),
          fetch('http://127.0.0.1:8000/api/superadmin/bookings/', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          }),
          fetch('http://127.0.0.1:8000/api/superadmin/payments/', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          })
        ]);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setRecentBookings(bookingsData.bookings?.slice(0, 5) || []);
        }

        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setRecentPayments(paymentsData.payments?.slice(0, 5) || []);
        }

      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #D1FAE5',
      borderRadius: '12px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ 
            color: '#6B7280', 
            fontSize: '14px', 
            fontWeight: '500', 
            marginBottom: '8px' 
          }}>
            {title}
          </div>
          <div style={{ 
            color: '#064E3B', 
            fontSize: '32px', 
            fontWeight: '700', 
            marginBottom: '4px' 
          }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
              {subtitle}
            </div>
          )}
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: `${color}20`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          {icon}
        </div>
      </div>
      {trend && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          backgroundColor: trend > 0 ? '#10B98120' : '#EF444420',
          borderRadius: '6px',
          fontSize: '12px',
          color: trend > 0 ? '#10B981' : '#EF4444'
        }}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );

  const BookingRow = ({ booking }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #D1FAE5',
      borderRadius: '8px',
      marginBottom: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#064E3B', fontWeight: '600', marginBottom: '4px' }}>
          #{booking.id} - {booking.service_name}
        </div>
        <div style={{ color: '#6B7280', fontSize: '14px' }}>
          {booking.user_name} → {booking.worker_name}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ 
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: 
            booking.booking_status === 'pending' ? '#FCD34D20' :
            booking.booking_status === 'confirmed' ? '#3B82F620' :
            booking.booking_status === 'completed' ? '#10B98120' :
            booking.booking_status === 'cancelled' ? '#EF444420' : '#6B728020',
          color: 
            booking.booking_status === 'pending' ? '#FCD34D' :
            booking.booking_status === 'confirmed' ? '#3B82F6' :
            booking.booking_status === 'completed' ? '#10B981' :
            booking.booking_status === 'cancelled' ? '#EF4444' : '#6B7280'
        }}>
          {booking.booking_status}
        </div>
        <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '4px' }}>
          {new Date(booking.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );

  const PaymentRow = ({ payment }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #D1FAE5',
      borderRadius: '8px',
      marginBottom: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#064E3B', fontWeight: '600', marginBottom: '4px' }}>
          #{payment.id} - {payment.customer_name || 'Customer'}
        </div>
        <div style={{ color: '#6B7280', fontSize: '14px' }}>
          Booking #{payment.booking_id}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color: '#064E3B', fontWeight: '600', marginBottom: '4px' }}>
          ₹{payment.amount}
        </div>
        <div style={{ 
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: 
            payment.status === 'paid' ? '#10B98120' :
            payment.status === 'pending' ? '#FCD34D20' :
            payment.status === 'refunded' ? '#3B82F620' :
            payment.status === 'failed' ? '#EF444420' : '#6B728020',
          color: 
            payment.status === 'paid' ? '#10B981' :
            payment.status === 'pending' ? '#FCD34D' :
            payment.status === 'refunded' ? '#3B82F6' :
            payment.status === 'failed' ? '#EF4444' : '#6B7280'
        }}>
          {payment.status}
        </div>
      </div>
    </div>
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
            <div style={{ color: '#94A3B8' }}>Loading dashboard...</div>
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
              Error loading dashboard
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
        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          <StatCard
            icon="👥"
            title="Total Users"
            value={stats.total_users || 0}
            subtitle={`${stats.new_users_this_month || 0} new this month`}
            color="#C6DE41"
            trend={12}
          />
          <StatCard
            icon="🔧"
            title="Total Workers"
            value={stats.total_workers || 0}
            subtitle={`${stats.new_workers_this_month || 0} new this month`}
            color="#10B981"
            trend={8}
          />
          <StatCard
            icon="📅"
            title="Total Bookings"
            value={stats.total_bookings || 0}
            subtitle={`${stats.pending_bookings || 0} pending`}
            color="#FCD34D"
            trend={15}
          />
          <StatCard
            icon="💰"
            title="Total Revenue"
            value={`₹${stats.total_revenue || 0}`}
            subtitle={`₹${stats.revenue_this_month || 0} this month`}
            color="#8B5CF6"
            trend={23}
          />
        </div>

        {/* Recent Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '32px' }}>
          {/* Recent Bookings */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h2 style={{ color: '#064E3B', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                Recent Bookings
              </h2>
              <button style={{
                backgroundColor: '#FCD34D',
                color: '#0C7C59',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#FDE68A'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#FCD34D'}>
                View All
              </button>
            </div>
            <div>
              {recentBookings.length > 0 ? (
                recentBookings.map(booking => (
                  <BookingRow key={booking.id} booking={booking} />
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1FAE5',
                  borderRadius: '8px',
                  color: '#6B7280'
                }}>
                  No recent bookings
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h2 style={{ color: '#064E3B', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                Recent Payments
              </h2>
              <button style={{
                backgroundColor: '#FCD34D',
                color: '#0C7C59',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#FDE68A'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#FCD34D'}>
                View All
              </button>
            </div>
            <div>
              {recentPayments.length > 0 ? (
                recentPayments.map(payment => (
                  <PaymentRow key={payment.id} payment={payment} />
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1FAE5',
                  borderRadius: '8px',
                  color: '#6B7280'
                }}>
                  No recent payments
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
};

export default DashboardOverview;
