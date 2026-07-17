import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/',                 icon: 'fa-home',          label: 'Home',     end: true  },
  { to: '/map',              icon: 'fa-map-marked-alt', label: 'Map'               },
  { to: '/alerts',           icon: 'fa-exclamation-triangle', label: 'Alerts'     },
  { to: '/report',           icon: 'fa-edit',          label: 'Report'            },
  { to: '/district-register',icon: 'fa-user-plus',     label: 'Register'          },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on route change
  useEffect(() => {
    setShowDropdown(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.user-profile-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">

          {/* Logo */}
          <div className="logo" onClick={() => navigate('/')}>
            <i className="fas fa-cloud-bolt logo-icon"></i>
            <span>Hyper<span className="logo-gradient">Weather</span></span>
          </div>

          {/* Desktop Nav */}
          <ul className="nav-menu">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                  <i className={`fas ${link.icon}`}></i> {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right: user */}
          <div className="nav-right-section">

            {/* User Profile */}
            {user ? (
              <div className="user-profile-container">
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
            ) : (
              <NavLink to="/login" className="login-btn">
                <i className="fas fa-sign-in-alt"></i> Sign In
              </NavLink>
            )}

          </div>
        </div>
      </nav>

      {/* Bottom Tab Bar (mobile) */}
      {user && (
        <nav className="bottom-tab-bar">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => isActive ? 'tab-item active' : 'tab-item'}
            >
              <i className={`fas ${link.icon}`}></i>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </>
  );
};

export default Navbar;