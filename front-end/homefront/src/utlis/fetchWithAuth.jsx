// src/utils/fetchWithAuth.js
export async function fetchWithAuth(url, options = {}) {
  let access = localStorage.getItem("access");
  let refresh = localStorage.getItem("refresh");

  // Build headers
  const headers = {
    ...(options.headers || {}),
    Authorization: access ? `Bearer ${access}` : undefined,
  };

  // First request
  let response = await fetch(url, { ...options, headers });

  // If unauthorized → try refresh
  if (response.status === 401) {
    if (!refresh) {
      // no refresh token → force logout
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
      return null;
    }

    // Try refreshing
    const refreshResponse = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (refreshResponse.ok) {
      // Save new token
      const data = await refreshResponse.json();
      localStorage.setItem("access", data.access);

      // Retry original request with new access token
      const retryHeaders = {
        ...(options.headers || {}),
        Authorization: `Bearer ${data.access}`,
      };
      response = await fetch(url, { ...options, headers: retryHeaders });
    } else {
      // Refresh failed → logout
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
      return null;
    }
  }

  return response;
}
