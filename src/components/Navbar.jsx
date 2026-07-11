// components/Navbar.jsx
import { useLanguage } from './LanguageContext'; // Context එක ගන්නවා
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // 🌟 1. මේ ලයින් එක අලුතින් එකතු කළා
  const { lang, setLang, t } = useLanguage();

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        
        {/* Logo Section */}
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <i className="fas fa-cloud-sun logo-icon"></i>
          <span>Hyper<span className="logo-gradient">Weather</span></span>
        </div>

        {/* Navigation Links Menu */}
        <ul className="nav-menu">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <i className="fas fa-home"></i> {t.home} {/* 🌟 සිංහල/දෙමළ වෙන්න වෙනස් කළා */}
            </NavLink>
          </li>
          <li>
            <NavLink to="/map" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <i className="fas fa-map-marked-alt"></i> {t.map} {/* 🌟 සිංහල/දෙමළ වෙන්න වෙනස් කළා */}
            </NavLink>
          </li>
          <li>
            <NavLink to="/alerts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <i className="fas fa-exclamation-triangle"></i> {t.alerts} {/* 🌟 සිංහල/දෙමළ වෙන්න වෙනස් කළා */}
            </NavLink>
          </li>
          <li>
            <NavLink to="/report" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <i className="fas fa-edit"></i> {t.report} {/* 🌟 සිංහල/දෙමළ වෙන්න වෙනස් කළා */}
            </NavLink>
          </li>
          <li>
            <NavLink to="/district-register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <i className="fas fa-user-plus"></i> {t.register} {/* 🌟 සිංහල/දෙමළ වෙන්න වෙනස් කළා */}
            </NavLink>
          </li>
        </ul>
        
        {/* Right Side: User Profile & Dropdown */}
        <div className="nav-right-section">

         {/* 🌟 2. මෙන්න Dropdown එක ලස්සනට Profile එක ළඟින්ම වාඩි කළා */}
<select 
  value={lang} 
  onChange={(e) => {
    const selectedLang = e.target.value;
    setLang(selectedLang); // Context එක update කරනවා
    localStorage.setItem('lang', selectedLang); // LocalStorage එකට දානවා
    
    // 🌟 අන්න ඒ සැනින් Register ඇතුළු අනිත් හැම පිටුවකටම දැනුම් දෙනවා!
    window.dispatchEvent(new Event('langChange'));
  }}
  className="lang-select"
>
  <option value="en">🌐 EN</option>
  <option value="si">🌐 සිංහල</option>
  <option value="ta">🌐 தமிழ்</option>
</select>

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

              {/* Modern Dropdown Menu */}
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
  );
};

export default Navbar;