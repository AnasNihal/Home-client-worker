// src/pages/WorkerSummary.jsx
import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:8000';

const WorkerSummary = () => {
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getAuthToken = useCallback(() => localStorage.getItem('access'), []);
  const getHeaders = useCallback(() => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  }), [getAuthToken]);

  // Fetch worker dashboard (counts + bookings)
  const loadWorkerData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/worker/dashboard`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to load data');
      const data = await response.json();
      setWorkerData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load summary data');
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  // Update booking status (accept/decline)
  const handleBookingAction = async (id, action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/update-status/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status: action })
      });

      if (!response.ok) throw new Error("Failed to update booking");
      const updated = await response.json();

      // Update bookings in state
      setWorkerData(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => b.id === id ? { ...b, status: updated.status } : b)
      }));

    } catch (err) {
      console.error(err);
      alert("Failed to update booking");
    }
  };

  useEffect(() => { loadWorkerData(); }, [loadWorkerData]);

  if (loading) return <p className="text-green text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!workerData) return <p className="text-green text-center mt-10">No data found</p>;

  return (
    <div className="min-h-screen bg-light_green p-6">
      {/* ===== Stats Section ===== */}
      <div className="pt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
        <StatCard title="Total Services" value={workerData?.services?.length || 0} />
        <StatCard title="Bookings" value={workerData?.bookings_count || 0} />
        <StatCard title="Rating" value={workerData?.ratings?.average_rating || 0} />
        <StatCard title="Reviews" value={workerData?.ratings?.total_ratings || 0} />
      </div>

      {/* ===== Bookings Section ===== */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-green mb-6">Bookings</h2>
        {workerData.bookings?.length > 0 ? (
          <div className="space-y-4">
            {workerData.bookings.map(b => (
              <div 
                key={b.id} 
                className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center"
              >
                {/* Booking details */}
                <div>
                  <p><strong>User:</strong> {b.user_name}</p>
                  <p><strong>Services:</strong> {b.services.join(", ")}</p>
                  <p><strong>Date:</strong> {b.date} at {b.time}</p>
                  <p className="mt-2">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-l font-bold text-green ${
                      b.status === "pending" ? "bg-yellow-500" : 
                      b.status === "accepted" ? "bg-green-600" : "bg-red-600"
                    }`}>
                      {b.status}
                    </span>
                  </p>
                </div>

                {/* Action buttons for pending bookings */}
                {b.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleBookingAction(b.id, "accepted")}
                      className="px-4 py-2 bg-green hover:bg-light_green hover:text-black text-white rounded-lg shadow"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleBookingAction(b.id, "declined")}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No bookings yet.</p>
        )}
      </div>
    </div>
  );
};

// Small card for stats
const StatCard = ({ title, value }) => (
  <div className="bg-green/20 rounded-2xl p-6 text-center shadow-lg">
    <h3 className="text-green font-semibold text-lg">{title}</h3>
    <p className="text-yellow font-bold text-3xl mt-2">{value}</p>
  </div>
);

export default WorkerSummary;
