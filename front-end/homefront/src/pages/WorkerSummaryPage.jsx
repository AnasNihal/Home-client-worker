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

  useEffect(() => { loadWorkerData(); }, [loadWorkerData]);

  if (loading) return <p className="text-green text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!workerData) return <p className="text-green text-center mt-10">No data found</p>;

  return (
    <div className="min-h-screen bg-light_green p-6 flex items-center justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full">
        <StatCard title="Total Services" value={workerData?.services?.length || 0} />
        <StatCard title="Bookings" value={workerData?.bookings_count || 0} />
        <StatCard title="Rating" value={workerData?.ratings?.average_rating || 0} />
        <StatCard title="Reviews" value={workerData?.ratings?.total_ratings || 0} />
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-green/20 rounded-2xl p-6 text-center shadow-xl">
    <h3 className="text-green font-semibold text-lg">{title}</h3>
    <p className="text-yellow font-bold text-3xl mt-2">{value}</p>
  </div>
);

export default WorkerSummary;
