import React, { useState, useEffect } from "react";
import { Link, useNavigate} from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const Navigate = useNavigate();

  // Toggle the menu visibility for mobile devices
  const toggleMenu = () => setIsOpen(!isOpen);

  // Check if the user is logged in by looking for a token in localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    setIsLoggedIn(!!accessToken); // Set the login state based on token existence
  }, []);

  // Handle logout (clear tokens and user data)
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    Navigate("/login")
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-3xl font-extrabold text-gray-900 hover:text-gray-700">
              CVPRO+
            </Link>
          </div>

          {/* Hamburger Menu for Mobile */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-900 hover:text-gray-700 focus:outline-none">
              {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>

          {/* Navigation Links and Sign Out Button */}
          <div className={`md:flex items-center space-x-8 ${isOpen ? "block" : "hidden"} md:static absolute top-20 left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none p-4 md:p-0 z-20`}>
            <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0 text-center md:text-left">
              {/* Show Home link with dynamic redirection */}
              <Link 
                to={isLoggedIn ? "/dashboard" : "/"} 
                className="text-gray-700 hover:text-black text-lg font-medium transition duration-300"
              >
                Home
              </Link>

              {/* Show these links only if the user is logged in */}
              {isLoggedIn && (
                <Link to="/rate-my-resume" className="text-gray-700 hover:text-black text-lg font-medium transition duration-300">
                  RateMyResume
                </Link>
              )}

              {/* Links visible for all users */}
              <Link to="/aboutus" className="text-gray-700 hover:text-black text-lg font-medium transition duration-300">
                About Us
              </Link>
              <Link to="/contactus" className="text-gray-700 hover:text-black text-lg font-medium transition duration-300">
                Contact Us
              </Link>
            </div>

            {/* Conditional Sign Out Button */}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="mt-4 md:mt-0 flex items-center bg-black text-white px-6 py-2 text-md rounded-full shadow-xl hover:bg-gray-800 transform hover:scale-110 transition duration-300"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            )}

            {/* Show Sign Up Button if not logged in */}
            {!isLoggedIn && (
              <Link to="/signup" className="mt-4 md:mt-0">
                <button className="flex items-center bg-black text-white px-6 py-2 text-md rounded-full shadow-xl hover:bg-gray-800 transform hover:scale-110 transition duration-300">
                  Sign Up
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
