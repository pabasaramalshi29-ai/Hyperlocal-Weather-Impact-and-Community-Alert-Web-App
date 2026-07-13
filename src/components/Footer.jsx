import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      padding: '20px', 
      textAlign: 'center', 
      backgroundColor: '#f8f9fa', 
      marginTop: '20px' 
    }}>
      <p>&copy; {new Date().getFullYear()} Hyperlocal Weather. All rights reserved.</p>
    </footer>
  );
};

export default Footer;