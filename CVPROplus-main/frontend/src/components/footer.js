import React from 'react';

const Footer = () => {
  return (
    <footer className="text-center py-6 text-gray-400 bg-black bg-opacity-50">
      © {new Date().getFullYear()} CVPRO+. All rights reserved.
    </footer>
  );
};

export default Footer;