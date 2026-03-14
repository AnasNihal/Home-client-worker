import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://127.0.0.1:8000"; // change to your backend URL

// 🔑 Utility: Get token and user info
/**
 * Authentication Helper Functions
 * Common utilities for user authentication and authorization
 */

export function getAuthData() {
  // use the short-lived JWT access token
  const token = localStorage.getItem("access") || null;
  let user = null;

  try {
    const userData = localStorage.getItem("user");
    if (userData && userData !== "undefined") {
      user = JSON.parse(userData);
    }
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    user = null;
  }

  return { token, user };
}

// 🔄 Redirect to login
export function redirectToLogin() {
  window.location.href = "/login"; // forces page change
}

// ✅ Book a worker
export async function bookWorker(workerId, bookingData) {
  const { token, user } = getAuthData();

  if (!token || !user) {
    redirectToLogin();
    return;
  }

  if (user.role?.toLowerCase() !== "user") {
    redirectToLogin();
    return;
  }

  try {
    const response = await fetchWithAuth(`${API_URL}/workers/${workerId}/book/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response) return;

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to book worker");
    }

    return await response.json();
  } catch (error) {
    throw error.message;
  }
}

// ✅ Rate a worker
export async function rateWorker(workerId, ratingValue, reviewText = "") {
  const { token, user } = getAuthData();

  if (!token || !user) {
    redirectToLogin();
    return;
  }

  if (user.role?.toLowerCase() !== "user") {
    redirectToLogin();
    return;
  }

  try {
    const response = await fetchWithAuth(`${API_URL}/workers/${workerId}/rate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating: ratingValue, review: reviewText }),
    });

    if (!response) return;

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to rate worker");
    }

    return await response.json();
  } catch (error) {
    throw error.message;
  }
}
