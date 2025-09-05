// src/pages/RegisterPage.jsx
import React, { useState } from "react";


export default function Register() {
  const [step, setStep] = useState("userType"); // 'userType', 'userForm', 'workerForm'
  const [userType, setUserType] = useState(""); // 'user' or 'worker'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    // Worker specific fields
    profession: "",
    experience: "",
    description: "",
    address: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // profession / category options
  const serviceCategories = [
    "Cleaning Services",
    "Plumbing",
    "Electrical Work",
    "Home Repair",
    "Gardening/Landscaping",
    "Interior Design",
    "Moving Services",
    "Appliance Repair",
    "Pest Control",
    "Security Installation",
  ];

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setStep(type === "user" ? "userForm" : "workerForm");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (userType === "worker") {
      if (!formData.profession)
        newErrors.profession = "Please select a profession";
      if (!formData.experience.trim())
        newErrors.experience = "Experience is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (!formData.address.trim())
        newErrors.address = "Address is required";
    }

    if (!formData.agreeToTerms)
      newErrors.agreeToTerms =
        "You must agree to the terms and conditions";

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
      if (userType === "worker") {
        const payload = {
          username: formData.name,
          name: formData.name,
          password: formData.password,
          email: formData.email || "",
          phone: formData.phone,
          profession: formData.profession,
          experience: formData.experience,
          location: formData.address,
          bio: formData.description,
        };

        const res = await fetch(
          "http://127.0.0.1:8000/auth/worker/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const data = await res.json();
        if (res.ok) {
          // ✅ Redirect to login instead of dashboard
          window.location.href = "/login";
        } else {
          setErrors({
            submit:
              data.message || JSON.stringify(data) || "Registration failed",
          });
        }
      } else {
        const payload = {
          username: formData.name,
          password: formData.password,
          email: formData.email || "",
          phone: formData.phone,
          address: formData.address || "",
          type: "user",
        };

        const res = await fetch(
          "http://127.0.0.1:8000/auth/user/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const data = await res.json();
        if (res.ok) {
          // ✅ Redirect to login instead of dashboard
          window.location.href = "/login";
        } else {
          setErrors({
            submit:
              data.message || JSON.stringify(data) || "Registration failed",
          });
        }
      }
    } catch (err) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep("userType");
    setUserType("");
  };

  // (Rendering code stays the same...)
  // -----------------------
  // Render: selection cards
  // -----------------------
  if (step === "userType") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green p-4">
        {/* ... unchanged card UI ... */}
      </div>
    );
  }

  // -----------------------
  // Render: the actual form
  // -----------------------
  return (
    <div className="flex min-h-screen items-center justify-center bg-green p-4">
      {/* ... unchanged form UI ... */}
    </div>
  );
}
