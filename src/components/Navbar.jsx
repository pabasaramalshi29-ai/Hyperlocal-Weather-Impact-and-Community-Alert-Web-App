import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        
        {/* Logo */}
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <i className="fas fa-cloud-sun logo-icon"></i>
          <span>Hyper<span className="logo-gradient">Weather</span></span>
        </div>

        {/* Hamburger Toggle */}
        <button 
          className={`hamburger-toggle ${isMenuOpen ? 'open' : ''}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span><span></span><span></span>
        </button>

        {/* Navigation Menu */}
        <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
              <i className="fas fa-home"></i> <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/map" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
              <i className="fas fa-map-marked-alt"></i> <span>Map</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/alerts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
              <i className="fas fa-exclamation-triangle"></i> <span>Alerts</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/report" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
              <i className="fas fa-edit"></i> <span>Report</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/district-register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
              <i className="fas fa-user-plus"></i> <span>Register</span>
            </NavLink>
          </li>
        </ul>
        
        {/* Right Section: User Profile & Dropdown */}
        <div className="nav-right-section">
          {user ? (
            <>
              {/* Desktop: Profile with dropdown */}
              <div className="user-profile-container desktop-only">
                <div 
                  className="user-profile-toggle" 
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {user.picture && (
                    <img src={user.picture} alt={user.name} className="user-avatar-img" />
                  )}
                  <span className="user-profile-name">{user.name}</span>
                  <i className={`fas fa-chevron-down arrow-icon ${showDropdown ? 'rotate' : ''}`}></i>
                </div>

                {showDropdown && (
                  <div className="profile-dropdown-menu">
                    <div className="dropdown-user-info">
                      <p className="welcome-text">Signed in as</p>
                      <p className="user-email-text">{user.email || user.name}</p>
                    </div>
                    <hr className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-logout-btn">
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile: Only Logout Icon */}
              <button onClick={handleLogout} className="mobile-logout-btn" aria-label="Logout">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </>
          ) : (
            <NavLink to="/login" className="login-btn">
              <i className="fas fa-sign-in-alt"></i> <span>Sign In</span>
            </NavLink>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;