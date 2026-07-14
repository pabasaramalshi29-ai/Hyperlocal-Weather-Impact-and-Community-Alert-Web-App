import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      padding: '24px 20px',
      textAlign: 'center',
      background: 'rgba(15, 23, 42, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      marginTop: 'auto', /* Push to bottom */
      color: '#94a3b8',
      fontSize: '0.9rem',
      fontFamily: "'Inter', sans-serif",
      width: '100%',
      position: 'relative',
      zIndex: 1
    }}>
      <p style={{ margin: 0 }}>
        &copy; {new Date().getFullYear()} Hyperlocal Weather. All rights reserved.
      </p>
      <p style={{ 
        margin: '4px 0 0 0', 
        fontSize: '0.8rem', 
        color: '#64748b',
        letterSpacing: '0.3px'
      }}>
        <i className="fas fa-cloud-sun" style={{ marginRight: '6px', color: '#60a5fa' }}></i>
        Real-time community alerts & weather insights
      </p>
    </footer>
  );
};

export default Footer;