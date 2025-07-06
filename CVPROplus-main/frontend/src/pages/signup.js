import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/signupbg2.jpg";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { BASE_URL } from "../Constant";

const Signup = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "", // Added location field
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Fetch user's location automatically
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prevData) => ({
            ...prevData,
            location: `${latitude},${longitude}`, // Store location as a string
          }));
        },
        (error) => {
          console.error("Error fetching location: ", error);
          setErrors((prevErrors) => ({
            ...prevErrors,
            location: "Unable to fetch location.",
          }));
        }
      );
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        location: "Geolocation is not supported by this browser.",
      }));
    }
  };

  // Call getLocation on component mount
  useEffect(() => {
    getLocation();
  }, []);

  // Validation function - runs WHILE TYPING
  const validateField = (name, value) => {
    let error = "";

    if (name === "first_name" && value.trim() === "") error = "First Name is required.";
    if (name === "last_name" && value.trim() === "") error = "Last Name is required.";
    if (name === "email") {
      if (!value.trim()) error = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format.";
    }
    if (name === "password") {
      if (value.length < 8) error = "Password must be at least 8 characters.";
      else if (!/[A-Z]/.test(value)) error = "Must contain at least one uppercase letter.";
      else if (!/[!@#$%^&*]/.test(value)) error = "Must contain at least one special character.";
      else if (!/\d/.test(value)) error = "Must contain at least one digit.";
    }
    if (name === "confirmPassword" && value !== formData.password)
      error = "Passwords do not match.";

    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  // Handle input change and validate WHILE TYPING
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  // Handle form submission
  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    Object.keys(formData).forEach((key) => validateField(key, formData[key]));

    // If any errors exist, prevent submission
    if (Object.values(errors).some((error) => error)) return;

    try {
      await axios.post("http://loacalhost/auth/register/", formData, {
        headers: { "Content-Type": "application/json" },
      });
      navigate("/login");
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again later." });
    }
  };
  
  const handleGoogleSignupSuccess = async (credentialResponse) => {
    console.log("Google Credential Response:", credentialResponse); // Debugging
  
    getLocation(); // Fetch location first
  
    try {
      const response = await axios.post("http://loacalhost/auth/google-login/", {
        token: credentialResponse.credential, // Ensure this is correctly passed
        location: formData.location, // Use the location from state
      });
  
      console.log("Backend Response:", response.data); // Debugging
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Signup Error:", error.response?.data || error.message); // Debugging
      setErrors({ general: "Google signup failed. Please try again." });
    }
  };
  
  return (
    <GoogleOAuthProvider clientId="1020835081770-vq18tvgqbcr1u1dc76cea0u1k9crop91.apps.googleusercontent.com">
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="w-full max-w-md p-8 bg-black bg-opacity-90 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white text-center mb-6">Sign Up</h2>
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white"
            />
            {errors.first_name && <p className="text-red-500">{errors.first_name}</p>}

            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white"
            />
            {errors.last_name && <p className="text-red-500">{errors.last_name}</p>}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white"
            />
            {errors.email && <p className="text-red-500">{errors.email}</p>}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="text-red-500">{errors.password}</p>}

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword}</p>}

            {errors.general && <p className="text-red-500 text-center">{errors.general}</p>}

            <button
              type="submit"
              className="w-full p-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500"
            >
              Sign Up
            </button>

            <p className="text-center text-gray-400 mt-4">OR</p>

            <GoogleLogin onSuccess={handleGoogleSignupSuccess} onError={() => setErrors({ general: "Google signup failed." })} />

            <p className="text-center text-gray-400 mt-4">
              Already have an account? <Link to="/login" className="text-blue-400 hover:text-white">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Signup;
