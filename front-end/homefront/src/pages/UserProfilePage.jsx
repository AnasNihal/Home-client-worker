// src/pages/UserProfilePage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { fetchAPI, uploadAPI } from "../utils/api";
import {
  PencilIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [preview, setPreview] = useState(null);

  /* ✅ OPTIMIZED: Load from cache first, then refresh */
  const fetchProfile = async () => {
    try {
      // Step 1: Try cache first (instant load)
      const cached = localStorage.getItem("user_profile");
      if (cached) {
        const data = JSON.parse(cached);
        setProfile(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          address: data.address || "",
          city: data.city || "",
          postal_code: data.postal_code || "",
          country: data.country || "",
          profileimage: null,
        });
        setPreview(data.profileimage_url || data.profileimage || null);
      }

      // Step 2: Refresh in background
      const fresh = await fetchAPI("/user/profile/");
      setProfile(fresh);
      localStorage.setItem("user_profile", JSON.stringify(fresh));

      setForm({
        first_name: fresh.first_name || "",
        last_name: fresh.last_name || "",
        email: fresh.email || "",
        phone: fresh.phone || "",
        bio: fresh.bio || "",
        address: fresh.address || "",
        city: fresh.city || "",
        postal_code: fresh.postal_code || "",
        country: fresh.country || "",
        profileimage: null,
      });
      setPreview(fresh.profileimage_url || fresh.profileimage || null);
    } catch (err) {
      console.error(err);
      if (!profile) {
        setError("Failed to fetch profile");
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const displayName = useMemo(() => {
    if (!profile) return "User";
    return (
      `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
      profile.username ||
      "User"
    );
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile) return "U";
    const first = profile.first_name?.[0] || profile.username?.[0] || "U";
    const last = profile.last_name?.[0] || "";
    return (first + last).toUpperCase();
  }, [profile]);

  const onChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profileimage") {
      const file = files?.[0] || null;
      setForm((f) => ({ ...f, profileimage: file }));
      setPreview(file ? URL.createObjectURL(file) : profile?.profileimage);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const onCancel = () => {
    if (!profile) return;

    setForm({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      bio: profile.bio || "",
      address: profile.address || "",
      city: profile.city || "",
      postal_code: profile.postal_code || "",
      country: profile.country || "",
      profileimage: null,
    });

    setPreview(profile.profileimage || null);
    setEditing(false);
  };

  const onSave = async () => {
    setSaving(true);
    setError("");

    if (form.phone) {
      let cleaned = form.phone.replace(/\s+/g, "");
      if (!cleaned.startsWith("+")) {
        cleaned = "+91" + cleaned;
      }
      form.phone = cleaned;
    }

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key !== "profileimage" && value !== null && value !== "") {
          data.append(key, value);
        }
      });

      if (form.profileimage instanceof File) {
        data.append("profileimage", form.profileimage);
      }

      const updated = await uploadAPI("/user/profile/", data, "PUT");

      setProfile(updated);
      setEditing(false);

      // ✅ Update cache
      localStorage.setItem("user_profile", JSON.stringify(updated));

      const newUrl = updated.profileimage_url || updated.profileimage || preview;
      setPreview(newUrl ? `${newUrl}?t=${Date.now()}` : null);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (error && !profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-light_green p-4">
        <div className="bg-white/30 rounded-2xl p-8 text-center text-green">
          {error}
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-light_green">
        <div className="bg-white/30 rounded-2xl p-8 text-center">
          <p className="text-green">Loading profile...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-light_green p-4 sm:p-6 relative top-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-green/20 rounded-3xl p-6 sm:p-8 shadow-xl relative">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <label className="cursor-pointer">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-green flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                    {initials}
                  </div>
                )}

                <input
                  type="file"
                  name="profileimage"
                  accept="image/*"
                  onChange={onChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-green mb-2">
                {displayName}
              </h1>
              <p className="text-green font-medium">{profile.email}</p>
            </div>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="absolute top-4 right-4 flex items-center gap-1 bg-yellow px-3 py-1 rounded-xl text-green hover:bg-yellow/90"
          >
            <PencilIcon className="h-4 w-4" /> Edit
          </button>
        </div>

        <div className="bg-green/20 rounded-3xl p-6 sm:p-8 shadow-xl relative">
          <h2 className="text-2xl font-bold text-green mb-4">Profile Details</h2>

          {!editing ? (
            <div className="space-y-3">
              <DetailRow
                icon={<UserIcon className="h-5 w-5" />}
                label="Name"
                value={displayName}
              />
              <DetailRow
                icon={<EnvelopeIcon className="h-5 w-5" />}
                label="Email"
                value={profile.email}
              />
              <DetailRow
                icon={<PhoneIcon className="h-5 w-5" />}
                label="Phone"
                value={profile.phone}
              />
              <DetailRow
                icon={<MapPinIcon className="h-5 w-5" />}
                label="Address"
                value={`${profile.address || ""}, ${profile.city || ""}, ${profile.country || ""}`}
              />

              <p className="text-green/70 mt-2">
                {profile.bio || "No bio added"}
              </p>
            </div>
          ) : (
            <ProfileEditForm
              form={form}
              onChange={onChange}
              onCancel={onCancel}
              onSave={onSave}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-green">
    <div className="bg-green/10 p-2 rounded-lg">{icon}</div>
    <div>
      <p className="text-green/70 text-sm">{label}</p>
      <p className="font-medium">{value || "N/A"}</p>
    </div>
  </div>
);

const ProfileEditForm = ({ form, onChange, onCancel, onSave, saving }) => (
  <form
    className="space-y-4"
    onSubmit={(e) => {
      e.preventDefault();
      onSave();
    }}
  >
    <input
      type="text"
      name="first_name"
      value={form.first_name}
      onChange={onChange}
      placeholder="First Name"
      className="w-full px-4 py-2 border rounded-lg"
    />
    <input
      type="text"
      name="last_name"
      value={form.last_name}
      onChange={onChange}
      placeholder="Last Name"
      className="w-full px-4 py-2 border rounded-lg"
    />
    <input
      type="email"
      name="email"
      value={form.email}
      onChange={onChange}
      placeholder="Email"
      className="w-full px-4 py-2 border rounded-lg"
    />
    <input
      type="text"
      name="phone"
      value={form.phone}
      onChange={onChange}
      placeholder="Phone"
      className="w-full px-4 py-2 border rounded-lg"
    />
    <textarea
      name="bio"
      value={form.bio}
      onChange={onChange}
      placeholder="Bio"
      className="w-full px-4 py-2 border rounded-lg"
    />

    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 bg-green/20 rounded-lg"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-yellow text-green rounded-lg"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  </form>
);