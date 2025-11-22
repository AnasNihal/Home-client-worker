import {
  UserIcon,
  PlusIcon,
  PencilIcon,
  BriefcaseIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

import {
  fetchAPI,
  postAPI,
  putAPI,
  deleteAPI,
  getImageURL,
} from "../utils/api";
// src/pages/WorkerDashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";


/* -----------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------ */
  const WorkerDashboard = () => {
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [error, setError] = useState("");

  /* ✅ OPTIMIZED: Load from cache first */
  const loadWorkerData = useCallback(async () => {
    try {
      setLoading(true);

      // Step 1: Load cached data instantly
      const cached = localStorage.getItem("worker_dashboard");
      if (cached) {
        const data = JSON.parse(cached);
        setWorkerData(data);
        setLoading(false);
      }

      // Step 2: Refresh in background
      const fresh = await fetchAPI("/worker/dashboard/");
      setWorkerData(fresh);
      localStorage.setItem("worker_dashboard", JSON.stringify(fresh));
    } catch (err) {
      console.error(err);
      if (!workerData) {
        setError("Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkerData();
  }, [loadWorkerData]);

  /* ----------------- SERVICE SAVE (ADD/EDIT) ------------------- */
  const handleServiceSave = async (serviceData) => {
    try {
      if (editingService) {
        await putAPI(`/worker/service/${editingService.id}`, serviceData);
        alert("Service updated!");
      } else {
        await postAPI("/worker/service", serviceData);
        alert("Service added!");
      }

      setEditingService(null);
      setIsServiceModalOpen(false);
      loadWorkerData();
    } catch (err) {
      console.error(err);
      alert("Failed to save service");
    }
  };

  /* ----------------- DELETE SERVICE ------------------- */
  const deleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      await deleteAPI(`/worker/service/${serviceId}`);
      alert("Service deleted!");
      loadWorkerData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete service");
    }
  };

  /* ----------------- UPDATE WORKER PROFILE ------------------- */
  const handleProfileSave = async (profileData) => {
    try {
      const updated = await putAPI("/worker/dashboard/", profileData);
      setWorkerData(updated);
      localStorage.setItem("worker_dashboard", JSON.stringify(updated));
      setIsProfileModalOpen(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  if (loading && !workerData) return <LoadingSpinner />;
  if (error && !workerData) return <ErrorMessage message={error} onRetry={loadWorkerData} />;

  return (
    <div className="min-h-screen bg-light_green p-4 sm:p-6 relative top-24">
      <div className="max-w-5xl mx-auto space-y-6">
        <ProfileHeader workerData={workerData} setWorkerData={setWorkerData} />

        <ProfileDetails
          workerData={workerData}
          onEdit={() => setIsProfileModalOpen(true)}
        />

        <ServicesSection
          services={workerData?.services || []}
          onAddService={() => setIsServiceModalOpen(true)}
          onEditService={(service) => {
            setEditingService(service);
            setIsServiceModalOpen(true);
          }}
          onDeleteService={deleteService}
        />
      </div>

      {/* SERVICE MODAL */}
      {isServiceModalOpen && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setEditingService(null);
            setIsServiceModalOpen(false);
          }}
          onSave={handleServiceSave}
        />
      )}

      {/* PROFILE EDIT MODAL */}
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

/* -----------------------------------------------------------
   COMPONENTS
------------------------------------------------------------ */

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
      <p className="text-green font-medium mb-4">{message}</p>
      <button
        className="bg-green text-white px-6 py-3 rounded-xl hover:bg-green/90"
        onClick={onRetry}
      >
        Try Again
      </button>
    </div>
  </div>
);

/* ----------------- PROFILE HEADER ------------------- */
const ProfileHeader = ({ workerData, setWorkerData }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);

      const updated = await fetchAPI("/worker/dashboard/", {
        method: "PUT",
        body: formData,
      });

      setWorkerData(updated);
      localStorage.setItem("worker_dashboard", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "W";

  return (
    <div className="bg-green/20 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          {workerData?.image ? (
            <img
              src={getImageURL(workerData.image)}
              className="w-32 h-32 rounded-full shadow-lg cursor-pointer object-cover"
              onClick={() => fileInputRef.current?.click()}
              alt="Worker"
            />
          ) : (
            <div
              className="w-32 h-32 bg-green text-white rounded-full flex items-center justify-center font-bold text-4xl cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {initials(workerData?.name)}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          <div className="absolute bottom-0 right-0 bg-yellow text-green p-2 rounded-full shadow">
            {uploading ? "⏳" : "✏️"}
          </div>
        </div>

        <div className="text-center sm:text-left flex-1">
          <h1 className="text-3xl font-bold text-green">{workerData?.name || "Worker"}</h1>
          <p className="text-yellow mt-1">
            {workerData?.profession?.name || "Worker"}
          </p>
          <p className="text-green mt-2">{workerData?.email || ""}</p>
        </div>
      </div>
    </div>
  );
};

/* ----------------- PROFILE DETAILS ------------------- */
const ProfileDetails = ({ workerData, onEdit }) => (
  <div className="bg-green/20 p-6 rounded-3xl shadow-xl relative">
    <h2 className="text-2xl font-bold text-green mb-4">Profile Details</h2>

    <DetailRow icon={<UserIcon className="h-5 w-5" />} label="Name" value={workerData?.name} />
    <DetailRow
      icon={<BriefcaseIcon className="h-5 w-5" />}
      label="Profession"
      value={workerData?.profession?.name}
    />
    <DetailRow
      icon={<MapPinIcon className="h-5 w-5" />}
      label="Location"
      value={workerData?.location}
    />
    <DetailRow icon={<PhoneIcon className="h-5 w-5" />} label="Phone" value={workerData?.phone} />
    <DetailRow icon={<EnvelopeIcon className="h-5 w-5" />} label="Email" value={workerData?.email} />

    <button
      onClick={onEdit}
      className="absolute top-4 right-4 flex items-center gap-1 bg-yellow px-3 py-1 rounded-xl text-green hover:bg-yellow/90"
    >
      <PencilIcon className="h-4 w-4" /> Edit
    </button>
  </div>
);

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-green mb-3">
    <div className="bg-green/10 p-2 rounded-lg">{icon}</div>
    <div>
      <p className="text-green/60 text-sm">{label}</p>
      <p className="font-medium">{value || "N/A"}</p>
    </div>
  </div>
);

/* ----------------- SERVICES SECTION ------------------- */
const ServicesSection = ({
  services,
  onAddService,
  onEditService,
  onDeleteService,
}) => (
  <div className="bg-green/20 rounded-3xl p-6 shadow-xl">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-green">My Services</h2>

      <button
        onClick={onAddService}
        className="flex items-center gap-2 bg-yellow text-green px-4 py-2 rounded-xl shadow-md hover:bg-yellow/90"
      >
        <PlusIcon className="h-5 w-5" /> Add Service
      </button>
    </div>

    <div className="space-y-4">
      {services.length === 0 ? (
        <p className="text-green/70">No services added yet.</p>
      ) : (
        services.map((s) => (
          <ServiceCard
            key={s.id}
            service={s}
            onEdit={() => onEditService(s)}
            onDelete={() => onDeleteService(s.id)}
          />
        ))
      )}
    </div>
  </div>
);

const ServiceCard = ({ service, onEdit, onDelete }) => (
  <div className="bg-green/10 rounded-2xl p-4 shadow-md flex justify-between">
    <div>
      <h3 className="text-green font-semibold">{service.services}</h3>
      <p className="text-green/70">{service.description}</p>
      <p className="text-green font-medium mt-1">₹{service.price}</p>
    </div>

    <div className="flex gap-3">
      <button
        onClick={onEdit}
        className="p-2 bg-yellow text-green rounded-lg hover:bg-yellow/90"
      >
        ✏️
      </button>

      <button
        onClick={onDelete}
        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        🗑️
      </button>
    </div>
  </div>
);

/* ----------------- SERVICE MODAL ------------------- */
const ServiceModal = ({ service, onClose, onSave }) => {
  const [title, setTitle] = useState(service?.services || "");
  const [description, setDescription] = useState(service?.description || "");
  const [price, setPrice] = useState(service?.price || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      services: title,
      description,
      price: Number(price),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {service ? "Edit Service" : "Add Service"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-2 border rounded-lg"
            placeholder="Service Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="w-full p-2 border rounded-lg"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <input
            className="w-full p-2 border rounded-lg"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>

            <button className="px-4 py-2 bg-yellow text-green rounded-lg">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ----------------- PROFILE EDIT MODAL ------------------- */
const ProfileEditModal = ({ workerData, onClose, onSave }) => {
  const [name, setName] = useState(workerData?.name || "");
  const [phone, setPhone] = useState(workerData?.phone || "");
  const [email, setEmail] = useState(workerData?.email || "");
  const [location, setLocation] = useState(workerData?.location || "");
  const [experience, setExperience] = useState(workerData?.experience || "");
  const [bio, setBio] = useState(workerData?.bio || "");
  const [professionId, setProfessionId] = useState(
    workerData?.profession?.id || ""
  );
  const [professions, setProfessions] = useState([]);

  useEffect(() => {
    // ✅ Load professions from cache first
    const cached = localStorage.getItem("professions_cache");
    if (cached) {
      setProfessions(JSON.parse(cached));
    }

    // Refresh in background
    fetchAPI("/worker/profession_list")
      .then((data) => {
        setProfessions(data);
        localStorage.setItem("professions_cache", JSON.stringify(data));
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      phone,
      email,
      location,
      experience,
      bio,
      profession_id: professionId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-md my-8">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-2 border rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />

          <input
            className="w-full p-2 border rounded-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
          />

          <input
            className="w-full p-2 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            className="w-full p-2 border rounded-lg"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
          />

          <input
            className="w-full p-2 border rounded-lg"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Experience"
          />

          <textarea
            className="w-full p-2 border rounded-lg"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
          />

          <select
            className="w-full p-2 border rounded-lg"
            value={professionId}
            onChange={(e) => setProfessionId(e.target.value)}
          >
            <option value="">Select Profession</option>
            {professions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>

            <button className="px-4 py-2 bg-yellow text-green rounded-lg">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerDashboard;