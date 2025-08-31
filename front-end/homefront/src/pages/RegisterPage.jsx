import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [step, setStep] = useState('userType'); // 'userType', 'userForm', 'workerForm'
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Worker specific fields
    serviceCategory: '',
    experience: '',
    description: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const serviceCategories = [
    'Cleaning Services',
    'Plumbing',
    'Electrical Work',
    'Home Repair',
    'Gardening/Landscaping',
    'Interior Design',
    'Moving Services',
    'Appliance Repair',
    'Pest Control',
    'Security Installation'
  ];

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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    // Worker specific validations
    if (userType === 'worker') {
      if (!formData.serviceCategory) {
        newErrors.serviceCategory = 'Please select a service category';
      }
      if (!formData.experience.trim()) {
        newErrors.experience = 'Experience is required';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Service description is required';
      }
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
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
      // Replace this with your actual registration API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: userType
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store user data
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Redirect based on user type
        if (userType === 'worker') {
          window.location.href = '/worker-dashboard';
        } else {
          window.location.href = '/user-dashboard';
        }
      } else {
        setErrors({ submit: data.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    }
    
    setIsLoading(false);
  };

  const goBack = () => {
    if (step === 'userForm' || step === 'workerForm') {
      setStep('userType');
      setUserType('');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        serviceCategory: '',
        experience: '',
        description: '',
        agreeToTerms: false
      });
      setErrors({});
    }
  };

  // User Type Selection Step
  if (step === 'userType') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-yellow mb-4">
              Join Our Platform
            </h1>
            <p className="text-xl text-light_green">Choose how you want to use our service</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Customer Registration Card */}
            <div 
              onClick={() => handleUserTypeSelect('user')}
              className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-4 border-transparent hover:border-yellow group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow to-yellow rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green mb-4">I need services</h3>
                <p className="text-gray-600 mb-6">
                  Find trusted professionals for all your home service needs. 
                  Book cleaners, plumbers, electricians, and more.
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> Browse verified service providers</p>
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> Read reviews and ratings</p>
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> Secure booking and payment</p>
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> 24/7 customer support</p>
                </div>
                <button className="w-full bg-gradient-to-r from-yellow to-yellow text-green py-3 px-6 rounded-xl hover:from-yellow hover:to-yellow transition-all duration-300 font-semibold transform group-hover:scale-105 shadow-lg">
                  Register as Customer
                </button>
              </div>
            </div>

            {/* Service Provider Registration Card */}
            <div 
              onClick={() => handleUserTypeSelect('worker')}
              className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-4 border-transparent hover:border-yellow group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green to-green rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green mb-4">I provide services</h3>
                <p className="text-gray-600 mb-6">
                  Join our network of trusted professionals. Grow your business 
                  and connect with customers in your area.
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> Access to thousands of customers</p>
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> Flexible scheduling</p>
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> Secure payments</p>
                  <p className="flex items-center"><span className="text-green mr-2">✓</span> Business growth tools</p>
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

  // Registration Form Step
  return (
    <div className="flex min-h-screen items-center justify-center bg-green p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl relative">
        {/* Back Button */}
        <button
          onClick={goBack}
          className="absolute top-6 left-6 p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green mb-2">
            Create Account
          </h2>
          <p className="text-gray-600">
            {userType === 'worker' ? 'Join as Service Provider' : 'Join as Customer'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {errors.submit && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            </div>
          )}

          {/* Two-column grid for inputs */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${
                  errors.name 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-yellow'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${
                  errors.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-yellow'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Phone & (if you want) a placeholder column for layout consistency */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${
                  errors.phone 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-yellow'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* empty placeholder or you can add another field here */}
            <div aria-hidden="true" />
          </div>

          {/* Worker-specific fields (two columns) */}
          {userType === 'worker' && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Category
                  </label>
                  <select
                    name="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={handleChange}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${
                      errors.serviceCategory 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-yellow'
                    }`}
                  >
                    <option value="">Select your service category</option>
                    {serviceCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.serviceCategory && (
                    <p className="mt-2 text-sm text-red-600">{errors.serviceCategory}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${
                      errors.experience 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-yellow'
                    }`}
                    placeholder="e.g., 5 years"
                  />
                  {errors.experience && (
                    <p className="mt-2 text-sm text-red-600">{errors.experience}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent resize-none ${
                    errors.description 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-yellow'
                  }`}
                  placeholder="Briefly describe your services and expertise"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </>
          )}

          {/* Passwords side-by-side */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${
                  errors.password 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-yellow'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow focus:border-transparent ${
                  errors.confirmPassword 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-yellow'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-yellow focus:ring-yellow border-gray-300 rounded mt-1"
              />
              <label htmlFor="agreeToTerms" className="ml-3 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-yellow hover:text-yellow font-semibold hover:underline">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-yellow hover:text-yellow font-semibold hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-600 font-medium">{errors.agreeToTerms}</p>}
          </div>

          {/* Enhanced Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-yellow to-yellow py-3 px-4 font-semibold text-green transition-all duration-300 hover:from-yellow hover:to-yellow hover:shadow-lg hover:shadow-yellow/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-yellow focus:ring-offset-2"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </div>
            ) : (
              `Create ${userType === 'worker' ? 'Provider' : 'Customer'} Account`
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-yellow hover:text-yellow hover:underline transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
