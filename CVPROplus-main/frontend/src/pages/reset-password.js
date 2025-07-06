import React, { useState, useEffect } from "react";
import backgroundImage from "../assets/signupbg2.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../Constant";

const ResetPassword = () => {
  const [passdata, setPassData] = useState({ email: "", token: "", new_password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility toggle
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility toggle
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email and token from location state
  useEffect(() => {
    if (location.state?.email && location.state?.token) {
      setPassData((prev) => ({
        ...prev,
        email: location.state.email,
        token: location.state.token,
      }));
    } else {
      setError("Invalid or expired reset request.");
    }
  }, [location.state]);

  // Handle input changes for password fields
  const handleChange = (e) => {
    setPassData({ ...passdata, [e.target.name]: e.target.value });
  };

  // Password reset function
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (passdata.new_password.trim() !== confirmPassword.trim()) {
      setError("Passwords do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passdata.new_password.trim())) {
      setError("Password must be at least 8 characters, include uppercase, a number, and a special character.");
      return;
    }

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("email", passdata.email);
      formData.append("token", passdata.token);
      formData.append("new_password", passdata.new_password.trim());

      // API call using Axios
      const response = await axios.post("http://loacalhost/auth/reset-password/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response.data);
      setMessage("Password reset successful! Redirecting to login...");
      setIsModalOpen(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full max-w-md p-8 bg-black bg-opacity-90 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-white text-center mb-6">Reset Your Password</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // Toggle between text and password
              name="new_password"
              placeholder="Enter new password"
              value={passdata.new_password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"} // Toggle between text and password
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle confirm password visibility
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500"
          >
            Reset Password
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p className="text-center text-gray-800">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
