// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAPI, postAPI } from "../utils/api";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState("userType");
  const [userType, setUserType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    profession_id: "",
    experience: "",
    description: "",
    address: "",
    agreeToTerms: false,
  });

  const [professions, setProfessions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Profession List
  useEffect(() => {
    const loadProfessions = async () => {
      try {
        // ✅ Check cache first
        const cached = localStorage.getItem("professions_cache");
        if (cached) {
          setProfessions(JSON.parse(cached).map(item => ({
            id: item.id,
            name: item.name || item.profession?.name,
          })));
        }

        // ✅ Fetch fresh data
        const data = await fetchAPI("/worker/profession_list/");
        setProfessions(
          data.map((item) => ({
            id: item.id,
            name: item.name || item.profession?.name,
          }))
        );
      } catch (err) {
        console.error("Failed to load professions", err);
        setErrors((prev) => ({ ...prev, professions: "Failed to load professions" }));
      }
    };

    if (step === "workerForm") loadProfessions();
  }, [step]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (userType === "worker") {
      if (!formData.profession_id) newErrors.profession_id = "Please select a profession";
      if (!formData.experience.trim()) newErrors.experience = "Experience is required";
      if (!formData.description.trim()) newErrors.description = "Description is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
    }

    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must accept the terms";

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
    setErrors({});

    try {
      if (userType === "worker") {
        // ✅ Added trailing slash
        await postAPI("/auth/worker/register/", {
          username: formData.name,
          name: formData.name,
          password: formData.password,
          email: formData.email,
          phone: formData.phone,
          profession_id: parseInt(formData.profession_id),
          experience: formData.experience,
          location: formData.address,
          bio: formData.description,
        });

        alert("Worker registration successful! Please login.");
        navigate("/login");
      } else {
        // ✅ Added trailing slash
        await postAPI("/auth/user/register/", {
          username: formData.name,
          password: formData.password,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          type: "user",
        });

        alert("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrors({ submit: err.message || "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep("userType");
    setUserType("");
    setErrors({});
  };

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    setStep(type === "worker" ? "workerForm" : "userForm");
  };

  if (step === "userType") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Join Our Platform</h1>
            <p className="text-xl text-white/90">Choose how you want to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Card */}
            <div
              onClick={() => handleUserTypeSelection("user")}
              className="group cursor-pointer bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green/20 transition-colors">
                  <svg className="w-10 h-10 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green mb-3">Join as Customer</h2>
                <p className="text-gray-600 mb-6">Find and hire skilled professionals for your home service needs</p>
                <ul className="text-left space-y-2 text-gray-700 mb-6">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Browse verified workers
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Easy booking system
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Secure payments
                  </li>
                </ul>
                <button className="w-full bg-green text-white py-3 rounded-lg font-semibold hover:bg-green/90 transition-colors">
                  Continue as Customer
                </button>
              </div>
            </div>

            {/* Worker Card */}
            <div
              onClick={() => handleUserTypeSelection("worker")}
              className="group cursor-pointer bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow/30 transition-colors">
                  <svg className="w-10 h-10 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green mb-3">Join as Service Provider</h2>
                <p className="text-gray-600 mb-6">Offer your skills and grow your business with our platform</p>
                <ul className="text-left space-y-2 text-gray-700 mb-6">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Get more clients
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Manage bookings easily
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Build your reputation
                  </li>
                </ul>
                <button className="w-full bg-yellow text-green py-3 rounded-lg font-semibold hover:bg-yellow/90 transition-colors">
                  Continue as Worker
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-white">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold underline hover:text-yellow transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl relative">
        <button
          onClick={goBack}
          type="button"
          className="absolute top-6 left-6 p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green mb-2">Create Account</h2>
          <p className="text-gray-600">
            {userType === "worker" ? "Join as Service Provider" : "Join as Customer"}
          </p>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="your@email.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green focus:border-transparent ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="1234567890"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {userType === "worker" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profession *</label>
                <select
                  name="profession_id"
                  value={formData.profession_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green focus:border-transparent ${
                    errors.profession_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select your profession</option>
                  {professions.map((prof) => (
                    <option key={prof.id} value={prof.id}>{prof.name}</option>
                  ))}
                </select>
                {errors.profession_id && <p className="mt-1 text-sm text-red-600">{errors.profession_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience *</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green focus:border-transparent ${
                    errors.experience ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 5 years"
                />
                {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About You *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green focus:border-transparent ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Tell us about your skills..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address {userType === "worker" && "*"}
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green focus:border-transparent ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Your address"
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green focus:border-transparent ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Create a strong password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green focus:border-transparent ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Re-enter your password"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-green focus:ring-green border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-600">
              I agree to the{" "}
              <Link to="/terms" className="text-green font-medium hover:underline">Terms and Conditions</Link>
            </label>
          </div>
          {errors.agreeToTerms && <p className="text-sm text-red-600">{errors.agreeToTerms}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green text-white py-3 rounded-lg font-semibold hover:bg-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-green font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}