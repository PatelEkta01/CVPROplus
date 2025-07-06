import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImage from "../assets/signupbg2.jpg";
import { BASE_URL } from "../Constant";

const ForgotPassword = () => {
  const [tokendata, setTokenData] = useState({ email: "", token: "" }); // Stores email and token
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter token
  const navigate = useNavigate();

  // Handle input changes for email and token
  const handleChange = (e) => {
    setTokenData({ ...tokendata, [e.target.name]: e.target.value });
  };

  // Handle email submission to send reset token
  const handleSendToken = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!tokendata.email) {
      setError("Please enter your email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tokendata.email)) {
      setError("Invalid email format.");
      return;
    }

    try {
      await axios.post("http://loacalhost/auth/forgot-password/", {
        email: tokendata.email,
      });

      setMessage("Password reset OTP sent to your email.");
      setStep(2); // Move to token verification step
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset token.");
    }
  };

  // Handle token verification
  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!tokendata.token) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      await axios.post("http://loacalhost/auth/verify-otp/", tokendata);

      setMessage("OTP verified successfully! Redirecting to reset password page...");
      setTimeout(() => {
        navigate("/resetpassword", { state: { email: tokendata.email, token: tokendata.token } });
      }, 1500); // Redirect after a short delay
    } catch (err) {
      setError(err.response?.data?.error || "Failed to verify token.");
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex items-center justify-center" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full max-w-md p-8 bg-black bg-opacity-90 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-white text-center mb-6">Forgot Password</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}

        {step === 1 ? (
          // Step 1: Email input
          <form onSubmit={handleSendToken} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={tokendata.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button
              type="submit"
              className="w-full p-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500"
            >
              Send OTP
            </button>
          </form>
        ) : (
          // Step 2: Token input
          <form onSubmit={handleVerifyToken} className="space-y-4">
            <input
              type="text"
              name="token"
              placeholder="Enter OTP"
              value={tokendata.token}
              onChange={handleChange}
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button
              type="submit"
              className="w-full p-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500"
            >
              Verify OTP
            </button>
          </form>
        )}
        <p className="text-center text-gray-300 mt-4">
          <Link to="/login" className="text-blue-400 hover:text-blue-300">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
