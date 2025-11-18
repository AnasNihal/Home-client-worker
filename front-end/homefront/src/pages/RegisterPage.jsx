// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { fetchAPI, postAPI } from "../utils/api";

export default function Register() {
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
        const data = await fetchAPI("/worker/profession_list");
        setProfessions(
          data.map((item) => ({
            id: item.id,
            name: item.name || item.profession?.name,
          }))
        );
      } catch (err) {
        console.error("Failed to load professions", err);
      }
    };

    if (step === "workerForm") loadProfessions();
  }, [step]);

  // Handle Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Name required";
    if (!formData.email) newErrors.email = "Email required";
    if (!formData.password) newErrors.password = "Password required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.phone) newErrors.phone = "Phone is required";

    if (userType === "worker") {
      if (!formData.profession_id) newErrors.profession_id = "Select profession";
      if (!formData.experience) newErrors.experience = "Experience required";
      if (!formData.description) newErrors.description = "Description required";
      if (!formData.address) newErrors.address = "Address required";
    }

    if (!formData.agreeToTerms) newErrors.agreeToTerms = "Accept terms";

    return newErrors;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (userType === "worker") {
        await postAPI("/auth/worker/register", {
          username: formData.name,
          name: formData.name,
          password: formData.password,
          email: formData.email,
          phone: formData.phone,
          profession_id: formData.profession_id,
          experience: formData.experience,
          location: formData.address,
          bio: formData.description,
        });

        window.location.href = "/worker/dashboard";
      } else {
        await postAPI("/auth/user/register", {
          username: formData.name,
          password: formData.password,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          type: "user",
        });

        window.location.href = "/login";
      }
    } catch (err) {
      setErrors({ submit: err.message || "Registration failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep("userType");
    setUserType("");
  };

  // --------------------------------------
  // MAIN UI (Your original JSX unchanged)
  // --------------------------------------

  if (step === "userType") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green p-4">
        <div className="w-full max-w-4xl">
          {/* UI for userType selection */}
          {/* ... your complete JSX code here ... */}
        </div>
      </div>
    );
  }

  // Registration Form UI
  return (
    <div className="flex min-h-screen items-center justify-center bg-green p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl relative">
        {/* Back Button */}
        <button
          onClick={goBack}
          className="absolute top-6 left-6 p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green mb-2">Create Account</h2>
          <p className="text-gray-600">
            {userType === "worker" ? "Join as Service Provider" : "Join as Customer"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ERRORS + FIELD INPUTS */}
          {/* ... your full JSX inputs here ... */}
        </form>
      </div>
    </div>
  );
}
