import React, { useState, useEffect } from 'react';
// import { 
//   EyeIcon, 
//   PencilSquareIcon, 
//   TrashIcon 
// } from '@heroicons/react/24/outline';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('http://127.0.0.1:8000/api/superadmin/services/', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
      } else {
        setError('Failed to fetch services');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = async (serviceId) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://127.0.0.1:8000/api/superadmin/services/${serviceId}/toggle/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        fetchServices(); // Refresh services list
      } else {
        setError('Failed to toggle service status');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://127.0.0.1:8000/api/superadmin/services/${serviceId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        fetchServices(); // Refresh services list
      } else {
        setError('Failed to delete service');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Service Management</h1>
          <p className="text-slate-600 mt-2">Manage all services offered by workers</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Services Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Service Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    #{service.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {service.worker_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div className="max-w-xs truncate">
                      {service.service_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div className="max-w-xs truncate">
                      {service.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    ₹{service.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.is_active 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {/* TODO: Navigate to service detail */}}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleToggleService(service.id)}
                        className="text-amber-600 hover:text-amber-900"
                        title="Toggle Status"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {services.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <div className="text-slate-500">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 9a2 2 0 012-2v2a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 00-2-2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">No services found</h3>
            <p className="mt-2 text-sm text-slate-500">
              There are currently no services in the system.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
