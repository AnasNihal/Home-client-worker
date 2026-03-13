// Temporary admin setup for testing
// Run this in browser console to create admin user

const setupAdmin = () => {
  // Create admin user data
  const adminData = {
    username: "admin",
    role: "admin",
    email: "admin@example.com"
  };
  
  // Store admin in localStorage
  localStorage.setItem("user", JSON.stringify(adminData));
};

// Auto-run setup
setupAdmin();
