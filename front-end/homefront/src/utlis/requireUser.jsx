// src/api/helpers/requireUser.js
export function requireUser() {
  const token = localStorage.getItem("token");
  let user = null;
  const userData = localStorage.getItem("user");

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (err) {
    console.error("Invalid user data in localStorage:", userData);
    user = null;
  }

  if (!token || !user || user.role !== "user") {
    window.location.href = "/login"; // redirect to login page
    return null;
  }

  return { token, user };
}
