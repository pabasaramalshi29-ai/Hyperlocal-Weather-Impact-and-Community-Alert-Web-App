// components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} Hyperlocal Weather. All rights reserved.
        </p>
        <p className="footer-tagline">
          <i className="fas fa-cloud-sun"></i>
          Real-time community alerts & weather insights
        </p>
      </div>
    </footer>
  );
};

export default Footer;