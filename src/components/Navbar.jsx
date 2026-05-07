// components/Navbar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="logo">
          <i className="fas fa-cloud-sun"></i> HyperWeather
        </div>
        <ul className="nav-menu">
          <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
          <li><NavLink to="/map" className={({ isActive }) => isActive ? 'active' : ''}>Map</NavLink></li>
          <li><NavLink to="/alerts" className={({ isActive }) => isActive ? 'active' : ''}>Alerts</NavLink></li>
          <li><NavLink to="/report" className={({ isActive }) => isActive ? 'active' : ''}>Report</NavLink></li>
        </ul>
        
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