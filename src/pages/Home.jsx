import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_KEY = "dc8754a29ab20f1c66f1c660f4346f20";

const getWeatherMeta = (condition = '') => {
  const c = condition.toLowerCase();
  if (c.includes('thunder') || c.includes('storm')) return { icon: '⛈️', color: '#7c3aed', label: 'Stormy' };
  if (c.includes('rain') || c.includes('drizzle'))   return { icon: '🌧️', color: '#0ea5e9', label: 'Rainy' };
  if (c.includes('snow'))  return { icon: '❄️', color: '#bae6fd', label: 'Snowy' };
  if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return { icon: '🌫️', color: '#94a3b8', label: 'Foggy' };
  if (c.includes('cloud')) return { icon: '☁️', color: '#64748b', label: 'Cloudy' };
  if (c.includes('clear')) return { icon: '☀️', color: '#f59e0b', label: 'Clear' };
  return { icon: '🌤️', color: '#38bdf8', label: 'Partly Cloudy' };
};

const Home = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const handleSearch = async () => {
    if (!location.trim()) { setError('Please enter a city name.'); return; }
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location},LK&units=metric&appid=${API_KEY}`
      );
      const data = await res.json();
      if (data.cod === 200) { setWeather(data); }
      else { setError('City not found in Sri Lanka. Try: Colombo, Kandy, Galle, Jaffna.'); setWeather(null); }
    } catch {
      setError('Failed to connect to weather service. Check your connection.');
    } finally { setLoading(false); }
  };

  const meta = weather ? getWeatherMeta(weather.weather[0].description) : null;

  return (
    <div className="page-wrapper">

      {/* ---- HERO ---- */}
      <section className="hero">
        <div className="container">
          <div style={{ fontSize: '3.5rem', marginBottom: '12px', lineHeight: 1 }}>
            {meta ? meta.icon : '⛈️'}
          </div>
          <h1>Hyperlocal Weather Impact<br />& Community Alerts</h1>
          <p>
            Real-time weather updates, district alerts &amp; community reports for Sri Lanka.
            Stay safe - stay informed.
          </p>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search city - Colombo, Kandy, Galle…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading} id="weather-search-btn">
              <i className="fas fa-search"></i>{' '}
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>

          {error && (
            <p style={{ marginTop: '14px', color: '#f87171', fontSize: '0.9rem' }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }}></i>{error}
            </p>
          )}
        </div>
      </section>

      {/* ---- DASHBOARD ---- */}
      <section className="dashboard">
        <div className="container">

          {/* Weather Card */}
          <div className="weather-card">
            <h2>
              <i className="fas fa-map-marker-alt"></i>
              {weather ? ` ${weather.name}, Sri Lanka` : ' Select a City'}
            </h2>

            <div className="weather-info">
              {/* Temperature */}
              <div>
                <i className="fas fa-temperature-high"></i>
                <span style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 800, display: 'block', color: meta?.color || '#38bdf8' }}>
                  {weather ? `${Math.round(weather.main.temp)}°C` : '--°C'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>Temperature</span>
              </div>

              {/* Condition */}
              <div>
                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>
                  {meta ? meta.icon : '🌡️'}
                </span>
                <span style={{ fontFamily: 'Outfit', fontWeight: 600, color: meta?.color || '#94a3b8', textTransform: 'capitalize' }}>
                  {weather ? weather.weather[0].description : 'Condition'}
                </span>
              </div>

              {/* Wind */}
              <div>
                <i className="fas fa-wind"></i>
                <span style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700, display: 'block', color: '#a78bfa' }}>
                  {weather ? `${weather.wind.speed}` : '--'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>m/s Wind</span>
              </div>
            </div>

            {/* Quick Stats */}
            {weather ? (
              <div className="quick-stats">
                <div className="stat-item">
                  <div className="stat-label">💧 Humidity</div>
                  <div className="stat-value">{weather.main.humidity}%</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">🤔 Feels Like</div>
                  <div className="stat-value">{Math.round(weather.main.feels_like)}°C</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">📊 Pressure</div>
                  <div className="stat-value">{weather.main.pressure}<span style={{ fontSize: '0.7rem' }}>hPa</span></div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">👁️ Visibility</div>
                  <div className="stat-value">{weather.visibility ? `${(weather.visibility / 1000).toFixed(1)}km` : 'N/A'}</div>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center', color: '#334155', fontSize: '0.87rem' }}>
                <i className="fas fa-search" style={{ marginRight: '8px', color: '#0ea5e9' }}></i>
                Search a Sri Lankan city to see live weather data
              </div>
            )}
          </div>

          {/* Alert Banner */}
          <div className="alert-banner">
            <h2>
              <i className="fas fa-exclamation-triangle"></i>
              Regional Alert
            </h2>
            <p style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#fcd34d' }}>⚠️ Monsoon Season Active</strong><br />
              Heavy rain warnings may be active for coastal and mountainous provinces.
              Landslide risk elevated in Kandy, Ratnapura &amp; Nuwara Eliya districts.
            </p>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              <i className="fas fa-clock" style={{ marginRight: '6px' }}></i>
              Updated: {new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <button className="alert-btn" onClick={() => navigate('/alerts')}>
              <i className="fas fa-bell" style={{ marginRight: '8px' }}></i>View All Alerts
            </button>
          </div>
        </div>

        {/* CTA Row */}
        <div className="container" style={{ marginTop: '24px' }}>
          <div className="cta-row">
            <a className="cta-card" href="/map" style={{ '--hover-color': '#0ea5e9' }}>
              <span className="cta-icon">🗺️</span>
              <h3>Weather Map</h3>
              <p>View live radar &amp; district weather overlays</p>
            </a>
            <a className="cta-card" href="/report" style={{ '--hover-color': '#7c3aed' }}>
              <span className="cta-icon">📝</span>
              <h3>Report Event</h3>
              <p>Submit a community weather or disaster report</p>
            </a>
            <a className="cta-card" href="/district-register" style={{ '--hover-color': '#f59e0b' }}>
              <span className="cta-icon">🔔</span>
              <h3>Get Alerts</h3>
              <p>Register your district for push notifications</p>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;