// components/Navbar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // 🌍 i18n add
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation(); // 🌍 t andd i18n variables 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 🌍 Language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="logo">
          <i className="fas fa-cloud-sun"></i> HyperWeather
        </div>
        <ul className="nav-menu">
          {/* 🌍  t()  */}
          <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>{t('home')}</NavLink></li>
          <li><NavLink to="/map" className={({ isActive }) => isActive ? 'active' : ''}>{t('map')}</NavLink></li>
          <li><NavLink to="/alerts" className={({ isActive }) => isActive ? 'active' : ''}>{t('alerts')}</NavLink></li>
          <li><NavLink to="/report" className={({ isActive }) => isActive ? 'active' : ''}>{t('report')}</NavLink></li>
        </ul>
        
        {/* 🌍  Language Selector Dropdown */}
        <div className="language-selector" style={{ marginLeft: 'auto', marginRight: '15px' }}>
          <select 
            onChange={(e) => changeLanguage(e.target.value)} 
            defaultValue={i18n.language}
            style={{
              background: '#1e293b',
              color: '#60a5fa',
              border: '1px solid #334155',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              outline: 'none'
            }}
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>

        {user && (
          <div className="user-section">
            {user.picture && (
              <img src={user.picture} alt={user.name} className="user-avatar" title={user.name} />
            )}
            <span className="user-name">{user.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;