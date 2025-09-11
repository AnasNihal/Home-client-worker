// src/pages/WorkerDashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  UserIcon, PlusIcon, PencilIcon, BriefcaseIcon, MapPinIcon, PhoneIcon, EnvelopeIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:8000';

const WorkerDashboard = () => {
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [error, setError] = useState('');

  const getAuthToken = useCallback(() => localStorage.getItem('access'), []);
  const getHeaders = useCallback(() => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  }), [getAuthToken]);

  // ----------------- Load Worker Dashboard -----------------
  const loadWorkerData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      if (!token) return setError('Please login to access the dashboard');

      const response = await fetch(`${API_BASE_URL}/worker/dashboard`, { headers: getHeaders() });

      if (!response.ok) {
        if (response.status === 401) setError('Session expired. Please login again.');
        else if (response.status === 403) setError('Access denied. Only workers can access this dashboard.');
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
  }, [getAuthToken, getHeaders]);

  useEffect(() => { loadWorkerData(); }, [loadWorkerData]);

  // ------------------- Service Handlers -------------------
  const handleServiceSave = async (serviceData) => {
    try {
      let response;
      if (editingService) {
        response = await fetch(`${API_BASE_URL}/worker/service/${editingService.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(serviceData)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/worker/service`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(serviceData)
        });
      }

      if (response.ok) {
        await loadWorkerData();
        setIsServiceModalOpen(false);
        setEditingService(null);
        alert(editingService ? 'Service updated!' : 'Service added!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to save service');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to save service');
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm('Are you sure to delete this service?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/worker/service/${serviceId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        await loadWorkerData();
        alert('Service deleted!');
      } else {
        throw new Error('Failed to delete service');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete service');
    }
  };

  // ------------------- Profile Edit Handler -------------------
  const handleProfileSave = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/worker/dashboard`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      const updatedData = await response.json();
      setWorkerData(updatedData);
      setIsProfileModalOpen(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update profile');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadWorkerData} />;
  if (!workerData) return <ErrorMessage message="No worker data found" onRetry={loadWorkerData} />;

  return (
    <div className="min-h-screen bg-light_green p-4 sm:p-6 relative top-24">
      <div className="max-w-5xl mx-auto space-y-6">
        <ProfileHeader workerData={workerData} setWorkerData={setWorkerData} />
        <ProfileDetails workerData={workerData} onEdit={() => setIsProfileModalOpen(true)} />
        <ServicesSection 
          services={workerData?.services || []}
          onAddService={() => setIsServiceModalOpen(true)}
          onEditService={(service) => { setEditingService(service); setIsServiceModalOpen(true); }}
          onDeleteService={deleteService}
        />
      </div>

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

// ----------------- Components -------------------
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-light_green">
    <div className="bg-white/30 rounded-2xl p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mb-4"></div>
      <p className="text-green font-medium">Loading dashboard...</p>
    </div>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-light_green p-4">
    <div className="bg-white/30 rounded-2xl p-8 text-center">
      <div className="text-green text-6xl mb-4">⚠️</div>
      <p className="text-green font-medium mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-green text-white px-6 py-3 rounded-xl hover:bg-green/90"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// ----------------- Profile Header (fixed image upload) -----------------
const ProfileHeader = ({ workerData, setWorkerData }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const token = localStorage.getItem("access");
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await fetch(`${API_BASE_URL}/worker/dashboard`, {
        method: "PUT",
        headers: {
       Authorization: `Bearer ${token}`, // only Authorization
       },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      setWorkerData(data); // update immediately
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name) =>
    name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "W";

  return (
    <div className="bg-green/20 rounded-3xl p-6 sm:p-8 shadow-xl relative">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          {workerData?.image ? (
            <img
              src={`${API_BASE_URL}${workerData.image}`}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover shadow-lg cursor-pointer"
              onClick={handleImageClick}
            />
          ) : (
            <div
              className="w-32 h-32 rounded-full bg-green flex items-center justify-center text-white font-bold text-4xl shadow-lg cursor-pointer"
              onClick={handleImageClick}
            >
              {getInitials(workerData?.name || workerData?.username)}
            </div>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Overlay edit button */}
          <div
            onClick={handleImageClick}
            className="absolute bottom-0 right-0 bg-yellow text-green p-2 rounded-full cursor-pointer shadow-md hover:bg-yellow/90"
          >
            {uploading ? "⏳" : "✏️"}
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-green mb-2">
            {workerData?.name || "Worker"}
          </h1>
          <p className="text-yellow font-medium">
            {workerData?.profession?.name || "Professional"}
          </p>
          <div className="mt-2 text-green">{workerData?.email || "N/A"}</div>
        </div>
      </div>
    </div>
  );
};

// ----------------- Rest of Components (unchanged) -----------------
const ProfileDetails = ({ workerData, onEdit }) => (
  <div className="bg-green/20 rounded-3xl p-6 sm:p-8 shadow-xl relative">
    <h2 className="text-2xl font-bold text-green mb-4">Profile Details</h2>
    <div className="space-y-3">
      <DetailRow icon={<UserIcon className="h-5 w-5" />} label="Name" value={workerData?.name} />
      <DetailRow icon={<BriefcaseIcon className="h-5 w-5" />} label="Profession" value={workerData?.profession?.name} />
      <DetailRow icon={<MapPinIcon className="h-5 w-5" />} label="Location" value={workerData?.location} />
      <DetailRow icon={<PhoneIcon className="h-5 w-5" />} label="Phone" value={workerData?.phone} />
      <DetailRow icon={<EnvelopeIcon className="h-5 w-5" />} label="Email" value={workerData?.email} />
    </div>
    <button onClick={onEdit} className="absolute top-4 right-4 flex items-center gap-1 bg-yellow px-3 py-1 rounded-xl text-green hover:bg-yellow/90">
      <PencilIcon className="h-4 w-4" /> Edit
    </button>
  </div>
);

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-green">
    <div className="bg-green/10 p-2 rounded-lg">{icon}</div>
    <div>
      <p className="text-green/70 text-sm">{label}</p>
      <p className="font-medium">{value || 'N/A'}</p>
    </div>
  </div>
);

const ServicesSection = ({ services, onAddService, onEditService, onDeleteService }) => (
  <div className="bg-green/20 rounded-3xl p-6 sm:p-8 shadow-xl">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-green">My Services</h2>
      <button
        onClick={onAddService}
        className="flex items-center gap-2 bg-yellow hover:bg-yellow/90 text-green px-4 py-2 rounded-xl shadow-md"
      >
        <PlusIcon className="h-5 w-5" /> Add Service
      </button>
    </div>
    <div className="space-y-4">
      {services.length === 0 && <p className="text-green/80">No services yet.</p>}
      {services.map(service => (
        <ServiceCard key={service.id} service={service} onEdit={() => onEditService(service)} onDelete={() => onDeleteService(service.id)} />
      ))}
    </div>
  </div>
);

const ServiceCard = ({ service, onEdit, onDelete }) => (
  <div className="bg-green/10 rounded-2xl p-4 flex justify-between items-center shadow-md">
    <div>
      <h3 className="text-green font-semibold">{service.services}</h3>
      <p className="text-green/70">{service.description}</p>
      <p className="text-green font-medium mt-1">₹{service.price}</p>
    </div>
    <div className="flex gap-3">
      <button onClick={onEdit} className="p-2 bg-yellow rounded-lg text-green hover:bg-yellow/90">✏️</button>
      <button onClick={onDelete} className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600">🗑️</button>
    </div>
  </div>
);

const ServiceModal = ({ service, onClose, onSave }) => {
  const [title, setTitle] = useState(service?.services || '');
  const [description, setDescription] = useState(service?.description || '');
  const [price, setPrice] = useState(service?.price || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ services: title, description, price: parseFloat(price) });
  };

  return (
    <div className="fixed inset-0 bg-green/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{service ? 'Edit Service' : 'Add Service'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Service Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-green/20 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-yellow text-green rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------- Profile Edit Modal -------------------
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
    fetch(`${API_BASE_URL}/worker/profession_list/`)
      .then(res => res.json())
      .then(data => setProfessions(data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, phone, email, location, experience, bio, profession_id: professionId });
  };

  return (
    <div className="fixed inset-0 bg-green/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <input type="text" placeholder="Experience" value={experience} onChange={e => setExperience(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <select value={professionId} onChange={e => setProfessionId(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Select Profession</option>
            {professions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex justify-end gap-3 mt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-green/20 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-yellow text-green rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerDashboard;
