// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [step, setStep] = useState('userType'); // 'userType', 'userForm', 'workerForm'
  const [userType, setUserType] = useState(''); // 'user' or 'worker'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    profession_id: '',   // use profession_id for backend
    experience: '',
    description: '',    
    address: '',        
    agreeToTerms: false
  });
  const [professions, setProfessions] = useState([]); // dynamic professions list
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch professions dynamically from backend when worker form is loaded
  useEffect(() => {
    async function fetchProfessions() {
      try {
        const res = await fetch('http://127.0.0.1:8000/worker/profession_list'); // profession endpoint
        const data = await res.json();
        // Flatten to array of { id, name } even if nested
        const profs = data.map(item => ({
          id: item.id,
          name: item.name || (item.profession && item.profession.name)
        }));
        setProfessions(profs);
      } catch (err) {
        console.error('Failed to fetch professions:', err);
      }
    }

    if (step === 'workerForm') fetchProfessions();
  }, [step]);

  const handleUserTypeSelect = (type) => {
    setUserType(type); 
    setStep(type === 'user' ? 'userForm' : 'workerForm');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    if (userType === 'worker') {
      if (!formData.profession_id) newErrors.profession_id = 'Please select a profession';
      if (!formData.experience.trim()) newErrors.experience = 'Experience is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }

    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (userType === 'worker') {
        const payload = {
          username: formData.name,
          name: formData.name,
          password: formData.password,
          email: formData.email || '',
          phone: formData.phone,
          profession_id: formData.profession_id, // send ID
          experience: formData.experience,
          location: formData.address,
          bio: formData.description
        };

        const res = await fetch('http://127.0.0.1:8000/auth/worker/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) window.location.href = '/worker/dashboard';
        else setErrors({ submit: data.message || JSON.stringify(data) || 'Registration failed' });
      } else {
        const payload = {
          username: formData.name,
          password: formData.password,
          email: formData.email || '',
          phone: formData.phone,
          address: formData.address || '',
          type: 'user'
        };

        const res = await fetch('http://127.0.0.1:8000/auth/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) window.location.href = '/login';
        else setErrors({ submit: data.message || JSON.stringify(data) || 'Registration failed' });
      }
    } catch (err) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep('userType');
    setUserType('');
  };

  // -----------------------
  // Render: selection cards
  // -----------------------
  if (step === 'userType') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-yellow mb-4">Join Our Platform</h1>
            <p className="text-xl text-light_green">Choose how you want to use our service</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Customer Registration Card */}
            <div onClick={() => handleUserTypeSelect('user')} className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-4 border-transparent hover:border-yellow group">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow to-yellow rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green mb-4">I need services</h3>
                <p className="text-gray-600 mb-6">Find trusted professionals for all your home service needs.</p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> Browse verified service providers</p>
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> Read reviews and ratings</p>
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> Secure booking and payment</p>
                </div>
                <button className="w-full bg-gradient-to-r from-yellow to-yellow text-green py-3 px-6 rounded-xl hover:from-yellow hover:to-yellow transition-all duration-300 font-semibold transform group-hover:scale-105 shadow-lg">
                  Register as Customer
                </button>
              </div>
            </div>

            {/* Service Provider Registration Card */}
            <div onClick={() => handleUserTypeSelect('worker')} className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-4 border-transparent hover:border-yellow group">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green to-green rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green mb-4">I provide services</h3>
                <p className="text-gray-600 mb-6">Join our network of trusted professionals. Grow your business.</p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> Access new customers</p>
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> Flexible scheduling</p>
                </div>
                <button className="w-full bg-gradient-to-r from-green to-green text-yellow py-3 px-6 rounded-xl hover:from-green hover:to-green transition-all duration-300 font-semibold transform group-hover:scale-105 shadow-lg">
                  Register as Service Provider
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-light_green">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow hover:text-yellow font-semibold hover:underline transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------
  // Render: the actual form
  // -----------------------
  return (
    <div className="flex min-h-screen items-center justify-center bg-green p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl relative">
        {/* Back Button */}
        <button onClick={goBack} className="absolute top-6 left-6 p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green mb-2">Create Account</h2>
          <p className="text-gray-600">{userType === 'worker' ? 'Join as Service Provider' : 'Join as Customer'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {errors.submit && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            </div>
          )}

          {/* Two-column grid for top inputs */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-yellow'}`}
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-yellow'}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

          {/* Phone & Address row (Address shown for customer here) */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-yellow'}`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* If customer, show Address */}
            {userType === 'user' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-yellow'}`}
                  placeholder="123 Main St, City"
                />
                {errors.address && <p className="mt-2 text-sm text-red-600">{errors.address}</p>}
              </div>
            ) : null}
          </div>

          {/* Password */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-yellow'}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-yellow'}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Worker-only fields */}
          {userType === 'worker' && (
            <>
              {/* Profession */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                <select
                  name="profession_id"
                  value={formData.profession_id}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${errors.profession_id ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-yellow'}`}
                >
                  <option value="">Select your profession</option>
                  {professions.map((prof) => (
                    <option key={prof.id} value={prof.id}>{prof.name}</option>
                  ))}
                </select>
                {errors.profession_id && <p className="mt-2 text-sm text-red-600">{errors.profession_id}</p>}
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${errors.experience ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-yellow'}`}
                  placeholder="e.g., 3 years"
                />
                {errors.experience && <p className="mt-2 text-sm text-red-600">{errors.experience}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-yellow'}`}
                  placeholder="Describe your skills and services"
                />
                {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-yellow'}`}
                  placeholder="Your work location"
                />
                {errors.address && <p className="mt-2 text-sm text-red-600">{errors.address}</p>}
              </div>
            </>
          )}

          {/* Terms */}
          <div className="flex items-center space-x-3">
            <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} />
            <label className="text-gray-700 text-sm">I agree to the terms and conditions</label>
          </div>
          {errors.agreeToTerms && <p className="mt-2 text-sm text-red-600">{errors.agreeToTerms}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green text-yellow py-3 px-6 rounded-xl font-semibold hover:bg-dark_green transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
