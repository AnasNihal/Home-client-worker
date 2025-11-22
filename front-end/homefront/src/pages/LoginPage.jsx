// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postAPI, fetchAPI } from "../utils/api";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  // ✅ OPTIMIZED LOGIN WITH PARALLEL LOADING
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
      // Step 1: Login
      const data = await postAPI("/auth/login/", {
        username: formData.username,
        password: formData.password,
      });

      // Step 2: Save tokens IMMEDIATELY (needed for next requests)
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("role", data.role);
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: data.username,
          role: data.role,
        })
      );

      // Step 3: Fetch ALL data in PARALLEL (much faster!)
      if (data.role === "user") {
        try {
          // ✅ Parallel fetch: profile, workers, professions
          const [profile, workers, professions] = await Promise.all([
            fetchAPI("/user/profile/"),
            fetchAPI("/worker/worker_list"),
            fetchAPI("/worker/profession_list"),
          ]);

          localStorage.setItem("user_profile", JSON.stringify(profile));
          localStorage.setItem("workers_cache", JSON.stringify(workers));
          localStorage.setItem("professions_cache", JSON.stringify(professions));

          console.log("✅ User data preloaded");
        } catch (err) {
          console.warn("Failed to prefetch user data:", err.message);
        }

        navigate("/profile/me");

      } else if (data.role === "worker") {
        try {
          // ✅ Parallel fetch: dashboard, professions
          const [dashboard, professions] = await Promise.all([
            fetchAPI("/worker/dashboard/"),
            fetchAPI("/worker/profession_list"),
          ]);

          localStorage.setItem("worker_dashboard", JSON.stringify(dashboard));
          localStorage.setItem("professions_cache", JSON.stringify(professions));

          console.log("✅ Worker data preloaded");
        } catch (err) {
          console.warn("Failed to prefetch worker data:", err.message);
        }

        navigate("/worker/dashboard");

      } else {
        navigate("/");
      }

    } catch (err) {
      setErrors({
        submit: err.message || "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b2e28]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-[#0b2e28]">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.submit && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`mt-1 w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.username
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-yellow-400"
              }`}
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="mt-2 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.password
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-yellow-400"
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-yellow-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-yellow-600 hover:text-yellow-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 py-3 px-4 font-semibold text-[#0b2e28] transition-all duration-300 hover:from-yellow-500 hover:to-yellow-600 hover:shadow-lg hover:shadow-yellow-400/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-yellow-600 hover:text-yellow-700 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}