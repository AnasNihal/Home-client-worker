// src/pages/WorkerDashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  UserIcon, BriefcaseIcon, CalendarIcon, CurrencyDollarIcon, 
  DocumentTextIcon, CogIcon, ArrowRightOnRectangleIcon, HomeIcon,
  PlusIcon, PencilIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, StarIcon
} from '@heroicons/react/24/outline';
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { useNavigate } from 'react-router-dom';
import AlertToast from '../components/AlertToast';

const API_BASE_URL = 'http://127.0.0.1:8000';

const WorkerDashboard = () => {
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const closeToast = () => setToast(null);

  // Load Worker Dashboard
  const loadWorkerData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchWithAuth(`${API_BASE_URL}/worker/dashboard/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response) return;

      if (!response.ok) {
        if (response.status === 403) setError('Access denied. Only workers can access this dashboard.');
        else setError('Failed to load dashboard data.');
        return;
      }

      const data = await response.json();
      setWorkerData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWorkerData(); }, [loadWorkerData]);

  // Service Handlers
  const handleServiceSave = async (serviceData) => {
    try {
      let response;
      if (editingService) {
        response = await fetchWithAuth(`${API_BASE_URL}/worker/service/${editingService.id}/`, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serviceData)
        });
      } else {
        response = await fetchWithAuth(`${API_BASE_URL}/worker/service/`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serviceData)
        });
      }

      if (!response) return;

      if (response.ok) {
        await loadWorkerData();
        setIsServiceModalOpen(false);
        setEditingService(null);
        setToast({
          type: 'success',
          title: editingService ? 'Service Updated' : 'Service Added',
          message: editingService ? 'Your service has been successfully updated.' : 'Your new service is now visible to customers.',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to save service');
      }
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        title: 'Service Error',
        message: err.message || 'Failed to save service. Please try again.',
      });
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm('Are you sure to delete this service?')) return;
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/worker/service/${serviceId}/`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response) return;
      if (response.ok) {
        await loadWorkerData();
        setToast({
          type: 'success',
          title: 'Service Deleted',
          message: 'Your service has been removed successfully.',
        });
      } else {
        throw new Error('Failed to delete service');
      }
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Could not remove the service right now.',
      });
    }
  };

  // Profile Edit Handler
  const handleProfileSave = async (profileData) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/worker/dashboard/`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData)
      });
      if (!response) return;
      if (!response.ok) throw new Error('Failed to update profile');
      const updatedData = await response.json();
      setWorkerData(updatedData);
      setIsProfileModalOpen(false);
      setToast({
        type: 'success',
        title: 'Profile Saved',
        message: 'Your profile settings were updated successfully.',
      });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        title: 'Profile Update Failed',
        message: err.message || 'Failed to update profile.',
      });
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadWorkerData} />;
  if (!workerData) return <ErrorMessage message="No worker data found" onRetry={loadWorkerData} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b2e28] via-[#1a4d3a] to-[#0b2e28] flex">
      {toast && (
        <AlertToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={closeToast}
        />
      )}
      {/* Sidebar */}
      <aside className="w-72 bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-[#0b2e28] font-bold text-lg">W</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Worker Portal</h1>
          </div>
          
          {/* Profile Summary */}
          <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              {workerData?.image ? (
                <img
                  src={workerData.image.startsWith("http") ? workerData.image : `${API_BASE_URL}${workerData.image}`}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover border-2 border-yellow-400 shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-[#0b2e28] font-bold text-xl shadow-lg">
                  {workerData?.name?.charAt(0)?.toUpperCase() || 'W'}
                </div>
              )}
              <div className="flex-1">
                <p className="text-white font-semibold text-lg">{workerData?.name || 'Worker'}</p>
                <p className="text-yellow-400 text-sm font-medium">{workerData?.profession?.name || 'Professional'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-yellow-400 font-bold text-lg">{workerData?.services?.length || 0}</p>
                <p className="text-white/70 text-xs">Services</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-yellow-400 font-bold text-lg">{workerData?.ratings?.average_rating?.toFixed(1) || '0.0'}</p>
                <p className="text-white/70 text-xs">Rating</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection('overview')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                activeSection === 'overview' 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] shadow-lg transform scale-105' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <HomeIcon className="h-5 w-5" />
              <span className="font-medium">Overview</span>
            </button>

            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                activeSection === 'profile' 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] shadow-lg transform scale-105' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <UserIcon className="h-5 w-5" />
              <span className="font-medium">Profile</span>
            </button>

            <button
              onClick={() => setActiveSection('services')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                activeSection === 'services' 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] shadow-lg transform scale-105' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BriefcaseIcon className="h-5 w-5" />
              <span className="font-medium">Services</span>
            </button>

            <button
              onClick={() => setActiveSection('bookings')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                activeSection === 'bookings' 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] shadow-lg transform scale-105' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <CalendarIcon className="h-5 w-5" />
              <span className="font-medium">Bookings</span>
            </button>

            <button
              onClick={() => setActiveSection('earnings')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                activeSection === 'earnings' 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] shadow-lg transform scale-105' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <CurrencyDollarIcon className="h-5 w-5" />
              <span className="font-medium">Earnings</span>
            </button>

            <button
              onClick={() => setActiveSection('settings')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                activeSection === 'settings' 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] shadow-lg transform scale-105' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <CogIcon className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </button>
          </nav>

          {/* Logout */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/80 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
          <div className="px-8 py-6">
            <h2 className="text-3xl font-bold text-white capitalize">
              {activeSection === 'overview' && 'Dashboard Overview'}
              {activeSection === 'profile' && 'Profile Management'}
              {activeSection === 'services' && 'Service Management'}
              {activeSection === 'bookings' && 'Booking Details'}
              {activeSection === 'earnings' && 'Earnings Overview'}
              {activeSection === 'settings' && 'Account Settings'}
            </h2>
            <p className="text-white/60 mt-2">
              {activeSection === 'overview' && 'Manage your professional profile and track your performance'}
              {activeSection === 'profile' && 'Update your personal information and professional details'}
              {activeSection === 'services' && 'Add, edit, or remove your service offerings'}
              {activeSection === 'bookings' && 'View and manage your upcoming and completed bookings'}
              {activeSection === 'earnings' && 'Monitor your income and payment history'}
              {activeSection === 'settings' && 'Configure your account preferences and security'}
            </p>
          </div>
        </header>

        <div className="p-8">
          {activeSection === 'overview' && <OverviewSection workerData={workerData} />}
          {activeSection === 'profile' && <ProfileSection workerData={workerData} onEdit={() => setIsProfileModalOpen(true)} setWorkerData={setWorkerData} />}
          {activeSection === 'services' && (
            <ServicesSection 
              services={workerData?.services || []}
              onAddService={() => setIsServiceModalOpen(true)}
              onEditService={(service) => { setEditingService(service); setIsServiceModalOpen(true); }}
              onDeleteService={deleteService}
            />
          )}
          {activeSection === 'bookings' && <BookingsSection />}
          {activeSection === 'earnings' && <EarningsSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </main>

      {/* Modals */}
      {isServiceModalOpen && (
        <ServiceModal
          service={editingService}
          onClose={() => { setIsServiceModalOpen(false); setEditingService(null); }}
          onSave={handleServiceSave}
        />
      )}

      {isProfileModalOpen && (
        <ProfileEditModal
          workerData={workerData}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
};

// Loading Spinner
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b2e28] via-[#1a4d3a] to-[#0b2e28]">
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
      <p className="text-white font-medium">Loading dashboard...</p>
    </div>
  </div>
);

// Error Message
const ErrorMessage = ({ message, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b2e28] via-[#1a4d3a] to-[#0b2e28] p-4">
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
      <div className="text-red-400 text-6xl mb-4">⚠️</div>
      <p className="text-white font-medium mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] px-6 py-3 rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// Overview Section
const OverviewSection = ({ workerData }) => (
  <div className="space-y-8">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Services"
        value={workerData?.services?.length || 0}
        icon={<BriefcaseIcon className="h-8 w-8" />}
        color="blue"
      />
      <StatCard
        title="Completed Jobs"
        value={workerData?.completed_jobs || 0}
        icon={<DocumentTextIcon className="h-8 w-8" />}
        color="green"
      />
      <StatCard
        title="Average Rating"
        value={workerData?.ratings?.average_rating?.toFixed(1) || '0.0'}
        icon={<StarIcon className="h-8 w-8" />}
        color="yellow"
      />
      <StatCard
        title="Total Reviews"
        value={workerData?.ratings?.total_ratings || 0}
        icon={<DocumentTextIcon className="h-8 w-8" />}
        color="purple"
      />
    </div>

    {/* Quick Info */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <PhoneIcon className="h-5 w-5 text-yellow-400" />
          Contact Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <PhoneIcon className="h-5 w-5 text-yellow-400" />
            <span className="text-white/90">{workerData?.phone || 'Not provided'}</span>
          </div>
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="h-5 w-5 text-yellow-400" />
            <span className="text-white/90">{workerData?.email || 'Not provided'}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-5 w-5 text-yellow-400" />
            <span className="text-white/90">{workerData?.location || 'Not provided'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <BriefcaseIcon className="h-5 w-5 text-yellow-400" />
          Professional Information
        </h3>
        <div className="space-y-4">
          <div>
            <span className="text-white/70 text-sm">Profession:</span>
            <p className="text-white font-medium">{workerData?.profession?.name || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-white/70 text-sm">Experience:</span>
            <p className="text-white font-medium">{workerData?.experience || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-white/70 text-sm">Bio:</span>
            <p className="text-white/90 mt-2">{workerData?.bio || 'No bio provided'}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-xl hover:transform hover:scale-105 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white/70">{title}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${
        color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
        color === 'green' ? 'bg-green-500/20 text-green-400' :
        color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-purple-500/20 text-purple-400'
      }`}>
        {icon}
      </div>
    </div>
  </div>
);

// Profile Section
const ProfileSection = ({ workerData, onEdit, setWorkerData }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await fetchWithAuth(`${API_BASE_URL}/worker/dashboard/`, {
        method: "PUT",
        body: formData,
      });

      if (!res) return;
      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      setWorkerData(data);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-semibold text-white">Profile Information</h3>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] px-6 py-3 rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-lg"
          >
            <PencilIcon className="h-4 w-4" /> Edit Profile
          </button>
        </div>

        <div className="flex items-center gap-8">
          <div className="relative">
            {workerData?.image ? (
              <img
                src={workerData.image.startsWith("http") ? workerData.image : `${API_BASE_URL}${workerData.image}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-2xl cursor-pointer"
                onClick={handleImageClick}
              />
            ) : (
              <div
                className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-[#0b2e28] font-bold text-4xl shadow-2xl cursor-pointer"
                onClick={handleImageClick}
              >
                {workerData?.name?.charAt(0)?.toUpperCase() || 'W'}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <div
              onClick={handleImageClick}
              className="absolute bottom-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] p-3 rounded-full cursor-pointer shadow-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300"
            >
              {uploading ? "⏳" : "📷"}
            </div>
          </div>

          <div className="flex-1">
            <h4 className="text-3xl font-bold text-white mb-2">{workerData?.name || "Worker"}</h4>
            <p className="text-yellow-400 font-medium text-lg mb-4">{workerData?.profession?.name || "Professional"}</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 text-yellow-400" />
                <span className="text-white/90 text-lg">{workerData?.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 text-yellow-400" />
                <span className="text-white/90 text-lg">{workerData?.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-5 w-5 text-yellow-400" />
                <span className="text-white/90 text-lg">{workerData?.location || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Services Section
const ServicesSection = ({ services, onAddService, onEditService, onDeleteService }) => (
  <div className="space-y-8">
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-semibold text-white">My Services</h3>
        <button
          onClick={onAddService}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] px-6 py-3 rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-lg"
        >
          <PlusIcon className="h-5 w-5" /> Add Service
        </button>
      </div>

      <div className="space-y-6">
        {services.length === 0 ? (
          <div className="text-center py-16">
            <BriefcaseIcon className="h-20 w-20 text-white/30 mx-auto mb-6" />
            <p className="text-white/60 text-lg mb-2">No services added yet</p>
            <p className="text-white/40">Add your first service to start getting bookings</p>
          </div>
        ) : (
          services.map(service => (
            <ServiceCard key={service.id} service={service} onEdit={() => onEditService(service)} onDelete={() => onDeleteService(service.id)} />
          ))
        )}
      </div>
    </div>
  </div>
);

// Service Card Component
const ServiceCard = ({ service, onEdit, onDelete }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-xl hover:transform hover:scale-102 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h4 className="text-xl font-semibold text-white mb-3">{service.services}</h4>
        <p className="text-white/70 mb-4 leading-relaxed">{service.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold text-yellow-400">₹{service.price}</p>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all duration-300"
              title="Edit service"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300"
              title="Delete service"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 2H4.667a2 2 0 01-2-2V7a2 2 0 012-2h6.666z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Bookings Section
const BookingsSection = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API_BASE_URL}/worker/bookings/`);
      if (!res) return;
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError("Error loading bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/bookings/${bookingId}/update-status/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res || !res.ok) throw new Error("Failed to update status");
      alert("Status updated successfully!");
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  if (loading) return <div className="text-white text-center py-10">Loading bookings...</div>;
  if (error) return <div className="text-red-400 text-center py-10">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-xl">
        <h3 className="text-2xl font-semibold text-white mb-6">Recent Bookings</h3>
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <CalendarIcon className="h-20 w-20 text-white/30 mx-auto mb-6" />
            <p className="text-white/60 text-lg mb-2">No bookings found</p>
            <p className="text-white/40">You don't have any bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-[#0b2e28] font-bold text-xl shadow-lg">
                      {b.user ? b.user.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{b.user}</h4>
                      <p className="text-white/70 text-sm mb-1">{b.service.services}</p>
                      <p className="text-white/80 text-sm">
                        📅 {b.date} at {b.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        b.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        b.status === "accepted" ? "bg-green-500/20 text-green-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {b.status.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        b.payment_status === "paid" ? "bg-green-500/20 text-green-400" :
                        b.payment_status === "failed" ? "bg-red-500/20 text-red-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        PAYMENT: {b.payment_status ? b.payment_status.toUpperCase() : "PENDING"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {b.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(b.id, "accepted")}
                            className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/40 font-semibold rounded-lg text-sm transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.id, "declined")}
                            className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 font-semibold rounded-lg text-sm transition"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {b.status === "accepted" && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, "completed")}
                          className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 font-semibold rounded-lg text-sm transition"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Earnings Section
const EarningsSection = () => (
  <div className="space-y-8">
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-xl">
      <h3 className="text-2xl font-semibold text-white mb-8">Earnings Overview</h3>
      <div className="text-center py-16">
        <CurrencyDollarIcon className="h-20 w-20 text-white/30 mx-auto mb-6" />
        <p className="text-white/60 text-lg mb-2">Earnings tracking coming soon</p>
        <p className="text-white/40">You'll be able to view your earnings and payment history here</p>
      </div>
    </div>
  </div>
);

// Settings Section
const SettingsSection = () => (
  <div className="space-y-8">
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-xl">
      <h3 className="text-2xl font-semibold text-white mb-8">Account Settings</h3>
      <div className="text-center py-16">
        <CogIcon className="h-20 w-20 text-white/30 mx-auto mb-6" />
        <p className="text-white/60 text-lg mb-2">Settings management coming soon</p>
        <p className="text-white/40">You'll be able to manage your account settings here</p>
      </div>
    </div>
  </div>
);

// Service Modal
const ServiceModal = ({ service, onClose, onSave }) => {
  const [title, setTitle] = useState(service?.services || '');
  const [description, setDescription] = useState(service?.description || '');
  const [price, setPrice] = useState(service?.price || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 100) {
      alert('Please enter a valid price of at least ₹100.');
      return;
    }
    onSave({ services: title, description, price: parsedPrice });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl border border-white/20">
        <h2 className="text-2xl font-bold text-[#0b2e28] mb-6">{service ? 'Edit Service' : 'Add Service'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Service Title</label>
            <input
              type="text"
              placeholder="e.g., Plumbing Repair"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Description</label>
            <textarea
              placeholder="Describe your service..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Price (₹)</label>
            <input
              type="number"
              min="100"
              step="0.01"
              placeholder="100.00"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
              required
            />
            <p className="mt-2 text-xs text-gray-500">Minimum service price is ₹100.</p>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-lg"
            >
              {service ? 'Update' : 'Add'} Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Profile Edit Modal
const ProfileEditModal = ({ workerData, onClose, onSave }) => {
  const [name, setName] = useState(workerData.name || '');
  const [phone, setPhone] = useState(workerData.phone || '');
  const [email, setEmail] = useState(workerData.email || '');
  const [location, setLocation] = useState(workerData.location || '');
  const [experience, setExperience] = useState(workerData.experience || '');
  const [bio, setBio] = useState(workerData.bio || '');
  const [professionId, setProfessionId] = useState(workerData.profession?.id || '');
  const [professions, setProfessions] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/professions/`)
      .then(res => res.json())
      .then(data => setProfessions(data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, phone, email, location, experience, bio, profession_id: professionId });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border border-white/20">
        <h2 className="text-2xl font-bold text-[#0b2e28] mb-6">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Experience</label>
            <input
              type="text"
              value={experience}
              onChange={e => setExperience(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Profession</label>
            <select
              value={professionId}
              onChange={e => setProfessionId(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
            >
              <option value="">Select Profession</option>
              {professions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              className="w-full px-4 py-3.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerDashboard;
