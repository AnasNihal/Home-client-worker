// src/pages/UserProfilePage.jsx
import React, { useEffect, useState, useMemo } from "react";

/* ---------------- Reusable fetch wrapper ---------------- */
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("access");
  if (!token) {
    window.location.href = "/login";
    return null;
  }
  const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem("access");
    window.location.href = "/login";
    return null;
  }
  return response;
}

/* ---------------- Skeleton loader ---------------- */
function Skeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="flex gap-6 max-w-4xl w-full p-6 bg-white rounded-2xl shadow animate-pulse">
        <div className="w-32 h-32 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-4 py-2">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Main Page ---------------- */
export default function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    bio: "",
    profileimage: null,
    address: "",
    city: "",
    postal_code: "",
    country: "",
  });
  const [preview, setPreview] = useState(null);

  /* ---------------- Fetch profile ---------------- */
  const fetchProfile = async () => {
    try {
      const res = await fetchWithAuth("http://127.0.0.1:8000/user/profile");
      if (!res || !res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();

      setProfile(data);
      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
        profileimage: null,
        address: data.address || "",
        city: data.city || "",
        postal_code: data.postal_code || "",
        country: data.country || "",
      });

      // ✅ Prefer absolute URL from backend
      setPreview(data.profileimage_url || data.profileimage || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []); // only run once

  /* ---------------- Computed values ---------------- */
  const displayName = useMemo(() => {
    if (!profile) return "Unknown User";
    return (
      `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
      profile.username ||
      "Unknown User"
    );
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile) return "US";
    const first = profile.first_name?.[0] || profile.username?.[0] || "U";
    const last = profile.last_name?.[0] || profile.username?.[1] || "S";
    return (first + last).toUpperCase();
  }, [profile]);

  /* ---------------- Image Upload Helper ---------------- */
  const uploadImage = async (file) => {
    const data = new FormData();
    data.append("profileimage", file);

    try {
      const res = await fetchWithAuth("http://127.0.0.1:8000/user/profile", {
        method: "PUT",
        body: data,
      });

      if (!res.ok) {
        console.error("Image upload failed");
        return;
      }

      const updated = await res.json();
      setProfile(updated);

      // ✅ Refresh preview with backend URL
      const newUrl = updated.profileimage_url || updated.profileimage;
      setPreview(
        newUrl ? `${newUrl}${newUrl.includes("?") ? "&" : "?"}t=${Date.now()}` : null
      );
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  /* ---------------- Handlers ---------------- */
  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileimage") {
      const file = files?.[0] || null;
      setForm((f) => ({ ...f, profileimage: file }));
      setPreview(file ? URL.createObjectURL(file) : profile?.profileimage || null);

      // 🔥 Auto-upload image as soon as it's selected
      if (file) uploadImage(file);
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
      profileimage: null,
      address: profile.address || "",
      city: profile.city || "",
      postal_code: profile.postal_code || "",
      country: profile.country || "",
    });
    setPreview(profile.profileimage || null);
    setEditing(false);
  };

  const onSave = async () => {
    setSaving(true);
    setError("");
    try {
      const data = new FormData();

      // Append all non-empty fields except profileimage
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "profileimage" && value !== null && value !== "") {
          data.append(key, value);
        }
      });

      // ✅ Only append profileimage if it's a File
      if (form.profileimage instanceof File) {
        data.append("profileimage", form.profileimage);
      }

      const res = await fetchWithAuth("http://127.0.0.1:8000/user/profile", {
        method: "PUT",
        body: data,
      });

      if (!res || !res.ok) {
        const text = (res && (await res.text().catch(() => ""))) || "";
        throw new Error(text || "Update failed");
      }

      const updated = await res.json();
      setProfile(updated);
      setEditing(false);

      // ✅ Prefer backend URL, add cache-busting
      const newUrl = updated.profileimage_url || updated.profileimage || preview;
      setPreview(
        newUrl ? `${newUrl}${newUrl.includes("?") ? "&" : "?"}t=${Date.now()}` : null
      );
    } catch (err) {
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- UI ---------------- */
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-amber-300 bg-white shadow-sm px-4 py-3 text-gray-800">
          {error}
        </div>
      </div>
    );

  if (!profile) return <Skeleton />;

  return (
    <div className="min-h-screen bg-green py-12 pt-24">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left: Profile Image */}
        <div className="md:w-1/3 bg-light_green flex flex-col items-center p-6">
          <label className="cursor-pointer w-40 h-40 overflow-hidden border-4 rounded-xl border-white shadow-md relative">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold bg-emerald-600">
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

          {!editing && (
            <h2 className="mt-4 text-xl font-semibold text-white">{displayName}</h2>
          )}
        </div>

        {/* Right: Details */}
        <div className="md:w-2/3 p-6 md:p-10 bg-light_green flex flex-col justify-between">
          {!editing ? (
            <ProfileView profile={profile} />
          ) : (
            <ProfileEdit
              form={form}
              preview={preview}
              onChange={onChange}
              onCancel={onCancel}
              onSave={onSave}
              saving={saving}
            />
          )}

          {!editing && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={fetchProfile}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-yellow text-primary rounded-lg shadow-sm hover:brightness-95 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */
function ProfileView({ profile }) {
  return (
    <div className="space-y-6">
      <Section title="Personal Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoBlock label="First Name" value={profile.first_name} />
          <InfoBlock label="Last Name" value={profile.last_name} />
          <InfoBlock label="Email" value={profile.email} />
          <InfoBlock label="Phone" value={profile.phone} />
        </div>
      </Section>

      <Section title="Address">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoBlock label="Address" value={profile.address} />
          <InfoBlock label="City" value={profile.city} />
          <InfoBlock label="Postal Code" value={profile.postal_code} />
          <InfoBlock label="Country" value={profile.country} />
        </div>
      </Section>

      <Section title="About">
        <p className="text-gray-700">{profile.bio || "—"}</p>
      </Section>
    </div>
  );
}

function ProfileEdit({ form, onChange, onCancel, onSave, saving }) {
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <Section title="Personal Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="First Name" name="first_name" value={form.first_name} onChange={onChange} />
          <TextField label="Last Name" name="last_name" value={form.last_name} onChange={onChange} />
          <TextField label="Email" type="email" name="email" value={form.email} onChange={onChange} />
          <TextField label="Phone" name="phone" value={form.phone} onChange={onChange} />
        </div>
      </Section>

      <Section title="Address">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Address" name="address" value={form.address} onChange={onChange} />
          <TextField label="City" name="city" value={form.city} onChange={onChange} />
          <TextField label="Postal Code" name="postal_code" value={form.postal_code} onChange={onChange} />
          <TextField label="Country" name="country" value={form.country} onChange={onChange} />
        </div>
      </Section>

      <Section title="About">
        <TextArea label="Bio" name="bio" value={form.bio} onChange={onChange} />
      </Section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-sm hover:brightness-110 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

/* ---------------- Helper components ---------------- */
function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-gray-900 font-semibold mb-2">{title}</h3>
      <div className="p-4 bg-gray-50 border rounded-lg">{children}</div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value || "—"}</span>
    </div>
  );
}

function TextField({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
      />
    </label>
  );
}

function TextArea({ label, name, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 resize-none"
      />
    </label>
  );
}
