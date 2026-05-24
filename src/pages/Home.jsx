// pages/Home.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [searchMessage, setSearchMessage] = useState('');

  const handleSearch = () => {
    if (location.trim()) {
      setSearchMessage(`Searching for weather in ${location}...`);
      setTimeout(() => setSearchMessage(''), 3000);
    } else {
      setSearchMessage('Please enter a location');
      setTimeout(() => setSearchMessage(''), 3000);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Hyperlocal Weather Impact & Community Alerts</h1>
          <p>Get real-time weather updates and community alerts for your area.</p>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Enter your location..." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>
              <i className="fas fa-search"></i> Search
            </button>
          </div>
          {searchMessage && <p style={{ marginTop: '16px', color: '#60a5fa' }}>{searchMessage}</p>}
        </div>
      </section>

      <section className="dashboard">
        <div className="container">
          <div className="weather-card">
            <h2><i className="fas fa-cloud-sun"></i> Current Weather</h2>
            <div className="weather-info">
              <div className="temp"><i className="fas fa-thermometer-half"></i> <span>72°F</span></div>
              <div className="rain"><i className="fas fa-cloud-rain"></i> <span>20% chance</span></div>
              <div className="wind"><i className="fas fa-wind"></i> <span>5 mph</span></div>
            </div>
            <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '0.9rem' }}>
              <i className="fas fa-map-marker-alt"></i> New York, NY
            </p>
          </div>
          <div className="alert-banner">
            <h2><i className="fas fa-exclamation-triangle"></i> High Priority Alert</h2>
            <p>Heavy rain expected in your area. Prepare for localized flooding in low-lying areas.</p>
            <button className="alert-btn" onClick={() => window.location.href = '/alerts'}>
              View Details
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;