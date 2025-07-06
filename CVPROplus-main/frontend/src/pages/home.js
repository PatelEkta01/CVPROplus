import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi"; // Import icons for menu
import backgroundImage from "../assets/home.png";

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div 
      className="min-h-screen bg-cover bg-center" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-black bg-opacity-80 min-h-screen flex flex-col justify-between">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-10 py-5 bg-black bg-opacity-50 shadow-md relative">
          <h1 className="text-white text-3xl font-extrabold tracking-widest">CVPRO+</h1>
          
          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6">
            <Link to="/login" className="text-white hover:text-gray-300 font-medium transition duration-300">Login</Link>
            <Link to="/signup" className="text-white hover:text-gray-300 font-medium transition duration-300">Sign Up</Link>
            <Link to="/aboutus" className="text-white hover:text-gray-300 font-medium transition duration-300">About Us</Link>
            <Link to="/contactus" className="text-white hover:text-gray-300 font-medium transition duration-300">Contact Us</Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white text-2xl" onClick={() => setMenuOpen(true)}>
            <FiMenu />
          </button>
        </nav>

        {/* Full-Screen Mobile Menu */}
        {menuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-6 z-50 transition-opacity duration-300">
            <button className="absolute top-6 right-6 text-white text-3xl" onClick={() => setMenuOpen(false)}>
              <FiX />
            </button>
            <Link to="/login" className="text-white text-2xl font-semibold" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/signup" className="text-white text-2xl font-semibold" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            <Link to="/aboutus" className="text-white text-2xl font-semibold" onClick={() => setMenuOpen(false)}>About Us</Link>
            <Link to="/contactus" className="text-white text-2xl font-semibold" onClick={() => setMenuOpen(false)}>Contact Us</Link>
          </div>
        )}

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center text-center px-6 py-20">
          <h2 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg animate-fadeIn">Create Your Perfect ATS-Friendly Resume</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl leading-relaxed animate-fadeIn delay-150">
            Stand out from the crowd with a professional resume that effortlessly passes Applicant Tracking Systems. Get started today and land your dream job!
          </p>
          <Link
            to="/signup"
            className="px-10 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-blue-500 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400 animate-fadeIn delay-300"
          >
            Get Started
          </Link>
        </div>

        {/* Features Section */}
        <div className="bg-white bg-opacity-90 py-12 px-6 md:px-20 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ATS-Friendly Templates</h3>
            <p className="text-gray-600">Choose from a variety of designs that pass ATS filters with ease.</p>
          </div>
          <div className="p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Customization</h3>
            <p className="text-gray-600">Edit and personalize your resume effortlessly with our intuitive tools.</p>
          </div>
          <div className="p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Tips</h3>
            <p className="text-gray-600">Get guidance from hiring experts to make your resume stand out.</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-gray-400 bg-black bg-opacity-50">
          © {new Date().getFullYear()} CVPRO+. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Home;
