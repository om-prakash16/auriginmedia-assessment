import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} JobFlow. All rights reserved.</p>
        <p className="footer-tagline">Empowering your career journey.</p>
      </div>
    </footer>
  );
};

export default Footer;
