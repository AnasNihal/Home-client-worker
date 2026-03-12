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
  console.log("Admin user setup complete!");
  console.log("Username: admin");
  console.log("Role: admin");
  console.log("You can now login as admin");
};

// Auto-run setup
setupAdmin();
