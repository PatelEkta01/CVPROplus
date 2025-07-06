import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // for navigation
import bcrypt from "bcryptjs"; // Import bcrypt for hashing

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate(); // Hook for navigation

  // This should be the stored hash in your database or environment
  const storedUsername = "admingroup6"; // Example username
  const storedPasswordHash = "$2b$12$qOpb2CnKbQaiHxr7cb/Lg.CmTCZh1KFQwN/mUyMWpBcWCKi8dHRXa"; // Example hashed password

  const handleLogin = () => {
    // Check if the entered username matches the stored username
    if (username === storedUsername) {
      // Compare the entered password with the hashed password
      const isPasswordCorrect = bcrypt.compareSync(password, storedPasswordHash);
      
      if (isPasswordCorrect) {
        // Store the admin role in localStorage
        localStorage.setItem("adminRole", "true");
        navigate("/admindashboard"); // Redirect to admin dashboard
      } else {
        setError("Invalid username or password.");
      }
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-800 via-gray-600 to-gray-400 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-center text-3xl font-bold text-gray-700 mb-6">Admin Login</h2>
        <div>
          <label className="block text-gray-600 font-medium mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // Toggle password visibility
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
              className="absolute right-3 top-3 text-gray-600 hover:bg-white"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full p-3 bg-gradient-to-r from-gray-800 via-gray-600 to-gray-400 text-white font-semibold rounded-md hover:bg-grey-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
