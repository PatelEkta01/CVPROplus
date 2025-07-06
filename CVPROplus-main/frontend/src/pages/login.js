import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/signupbg2.jpg";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
// import googlelogo from "../assets/google.png";
import axios from "axios";
import { BASE_URL } from "../Constant";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Load stored credentials if Remember Me was checked
  useState(() => {
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    if (storedEmail && storedPassword) {
      setFormData({ email: storedEmail, password: storedPassword });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      setMessage("Enter a valid email address.");
      return false;
    }
    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post("http://loacalhost/auth/login/", formData, {
        headers: { "Content-Type": "application/json" },
      });

      const { access_token, refresh_token, user } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem("email", formData.email);
        localStorage.setItem("password", formData.password);
      } else {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
      }

      navigate("/dashboard");
    } catch (error) {
      setMessage("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignupSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post("http://loacalhost/auth/google-login/", {
        token: credentialResponse.credential,
      });

      const { access_token, refresh_token, user } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (error) {
      setMessage("Google login failed.");
    }
  };

  return (
    <GoogleOAuthProvider clientId="1020835081770-vq18tvgqbcr1u1dc76cea0u1k9crop91.apps.googleusercontent.com">
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="w-full max-w-md p-8 bg-black bg-opacity-90 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white text-center mb-6">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white"
            />

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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-300">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2"
                />
                Remember Me
              </label>
              <a href="/forgotpassword" className="hover:underline">
                Forgot Password?
              </a>
            </div>

            {message && <p className="text-center text-red-500 mt-4">{message}</p>}

            <button
              type="submit"
              className="w-full p-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            <p className="text-center text-white mt-4">OR</p>

            <GoogleLogin onSuccess={handleGoogleSignupSuccess} onError={() => setMessage("Google login failed.")} />
            <br/>
            <Link to="/signup">
              <button
                type="button"
                className="w-full p-3 bg-white text-grey-100 font-semibold rounded-lg hover:bg-gray-100 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500"
              >
                Sign Up with Email
              </button>
            </Link>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
