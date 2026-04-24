// components/Navbar.jsx
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo">
          <i className="fas fa-cloud-sun"></i> HyperWeather
        </div>
        <ul className="nav-menu">
          <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
          <li><NavLink to="/map" className={({ isActive }) => isActive ? 'active' : ''}>Map</NavLink></li>
          <li><NavLink to="/alerts" className={({ isActive }) => isActive ? 'active' : ''}>Alerts</NavLink></li>
          <li><NavLink to="/report" className={({ isActive }) => isActive ? 'active' : ''}>Report</NavLink></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;