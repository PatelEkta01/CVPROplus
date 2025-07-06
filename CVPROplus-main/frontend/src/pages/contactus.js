import React, { useState } from 'react';
import axios from 'axios';
// import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import { FaFacebook, FaWhatsapp, FaInstagram } from 'react-icons/fa';

const ContactUs = () => {
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactData({ ...contactData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = {};
    if (!contactData.name.trim()) {
      validationErrors.name = 'Name is required';
    }
    if (!validateEmail(contactData.email)) {
      validationErrors.email = 'Invalid email format';
    }
    
    if (!contactData.subject.trim()) {
      validationErrors.subject = 'Subject is required';
    }
    
    if (!contactData.message.trim()) {
      validationErrors.message = 'Message is required';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axios.post("http://loacalhost/auth/contact-us/", contactData);
      console.log('Message sent:', response.data);
      alert('Your message has been sent successfully!');
      setErrors({});
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col" style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?nature,water')" }}>
      <Navbar />
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-black bg-opacity-90 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white text-center mb-6">Get in Touch</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={contactData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={contactData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={contactData.subject}
              onChange={handleChange}
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
            <textarea
              name="message"
              placeholder="Your Message"
              rows={3}
              value={contactData.message}
              onChange={handleChange}
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            ></textarea>
            {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
            <button
              type="submit"
              className="w-full p-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500"
            >
              Send Message
            </button>
          </form>
          <div className="text-center text-gray-400 mt-6">
            <p>Or reach us at:</p>
            <p className="text-white font-medium">cvproplus@gmail.com | +1 234 567 890</p>
          </div>
          <div className="flex justify-center space-x-4 mt-4 text-white">
            <a href = "https://www.facebook.com">
            <FaFacebook className="text-2xl cursor-pointer hover:text-blue-500" /></a>
            <a href = "https://www.whatsapp.com"><FaWhatsapp className="text-2xl cursor-pointer hover:text-green-400" /></a>
            <a href = "https://www.instagram.com"><FaInstagram className="text-2xl cursor-pointer hover:text-pink-500" /></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
