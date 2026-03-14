/**
 * Authentication wrapper for fetch API calls
 * Handles token-based authentication for API requests
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options object
 * @returns {Promise} Fetch response with error handling
 */
export async function fetchWithAuth(url, options = {}) {
  let access = localStorage.getItem("access");
  let refresh = localStorage.getItem("refresh");

  const headers = {
    ...(options.headers || {}),
  };

  if (access) {
    headers.Authorization = `Bearer ${access}`;
  }

  // First request
  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    if (!refresh) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      window.location.href = "/login";
      return null;
    }

    // Refresh access token
    const refreshResponse = await fetch("http://127.0.0.1:8000/auth/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();

      // 🔑 Save new tokens
      localStorage.setItem("access", data.access);
      if (data.refresh) {
        localStorage.setItem("refresh", data.refresh); // handle rotated refresh
      }

      // Retry original request
      const retryHeaders = {
        ...(options.headers || {}),
        Authorization: `Bearer ${data.access}`,
      };
      response = await fetch(url, { ...options, headers: retryHeaders });
    } else {
      // Refresh failed → logout
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      window.location.href = "/login";
      return null;
    }
  }

  return response;
}
