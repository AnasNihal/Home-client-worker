// src/pages/UserProfilePage.jsx
import React, { useEffect, useState } from "react";
import { getAuthData } from "../utils/useHelper";
import { PencilIcon, UserIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

export default function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    // Get user data from localStorage instead of API call
    const { user } = getAuthData();
    if (user) {
      setProfile({
        username: user.username,
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: '',
        bio: '',
        address: '',
        city: '',
        postal_code: '',
        country: ''
      });
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: '',
        bio: '',
        address: '',
        city: '',
        postal_code: '',
        country: ''
      });
    } else {
      setError("No user data found");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "phone"
      ? value.replace(/\D/g, '').slice(0, 10)
      : value;
    setForm(prev => ({ ...prev, [name]: nextValue }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Simulate saving - just update local state
      setProfile(prev => ({ ...prev, ...form }));
      setEditing(false);
      setTimeout(() => setSaving(false), 1000);
    } catch (err) {
      setError("Failed to save profile");
      setSaving(false);
    }
  };

  const displayName = profile ? 
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || 
    profile.username || 
    "User" 
    : "User";

  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b2e28] to-[#1a4d3a] flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-white font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0b2e28] px-6 py-3 rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1c392e] to-[#1E5F4B] p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{displayName}</h1>
                <p className="text-gray-200 text-lg">{profile?.email || 'No email'}</p>
                <p className="text-gray-300 text-sm mt-2">Member since {new Date().toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg"
              >
                <PencilIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {editing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1c392e] focus:border-transparent transition-all duration-200"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1c392e] focus:border-transparent transition-all duration-200"
                      placeholder="Last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1c392e] focus:border-transparent transition-all duration-200"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1c392e] focus:border-transparent transition-all duration-200"
                      placeholder="9876543210"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1c392e] focus:border-transparent transition-all duration-200"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1c392e] focus:border-transparent transition-all duration-200"
                      placeholder="Country"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1c392e] focus:border-transparent transition-all duration-200"
                    placeholder="Tell us about yourself"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-[#f8d357] text-[#1c392e] rounded-xl font-semibold hover:bg-[#f5c842] transition-all duration-300 disabled:opacity-50 shadow-lg"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#97bf8a]/20 rounded-xl flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-[#1c392e]" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Full Name</p>
                      <p className="text-gray-900 font-medium text-lg">{displayName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#97bf8a]/20 rounded-xl flex items-center justify-center">
                      <EnvelopeIcon className="h-6 w-6 text-[#1c392e]" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Email</p>
                      <p className="text-gray-900 font-medium text-lg">{profile?.email || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#97bf8a]/20 rounded-xl flex items-center justify-center">
                      <PhoneIcon className="h-6 w-6 text-[#1c392e]" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Phone</p>
                      <p className="text-gray-900 font-medium text-lg">{profile?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#97bf8a]/20 rounded-xl flex items-center justify-center">
                        <MapPinIcon className="h-6 w-6 text-[#1c392e]" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Location</p>
                        <p className="text-gray-900 font-medium text-lg">
                          {profile?.city && profile?.country 
                            ? `${profile.city}, ${profile.country}`
                            : profile?.city || profile?.country || 'Not provided'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#97bf8a]/20 rounded-xl flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-[#1c392e]" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Username</p>
                        <p className="text-gray-900 font-medium text-lg">@{profile?.username || 'unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#97bf8a]/20 rounded-xl flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-[#1c392e]" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Account Type</p>
                        <p className="text-gray-900 font-medium text-lg">Regular User</p>
                      </div>
                    </div>
                  </div>
                </div>
                {profile?.bio && (
                  <div className="bg-[#97bf8a]/10 rounded-xl p-6 border border-[#97bf8a]/30">
                    <h3 className="text-[#1c392e] font-semibold mb-3 text-lg">About</h3>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
