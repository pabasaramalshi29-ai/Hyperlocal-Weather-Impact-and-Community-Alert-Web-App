
import { useState } from 'react';

const Home = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a city name.');
      return;
    }

    setLoading(true);
    setError('');
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    try {
     
     const response = await fetch(
     `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`
     );
      const data = await response.json();

      if (data.cod === 200) {
        setWeather(data);
      } else {
        setError('City not found in Sri Lanka. Please try Colombo, Kandy, or Galle.');
        setWeather(null);
      }
    } catch (err) {
      setError('Failed to connect to the weather service.');
    } finally {
      setLoading(false);
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
              placeholder="Search ( Colombo, Jaffna, Kandy)..." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading}>
              <i className="fas fa-search"></i> {loading ? "..." : "Search"}
            </button>
          </div>
          {error && <p style={{ marginTop: '16px', color: '#f87171' }}>{error}</p>}
        </div>
      </section>

      <section className="dashboard">
        <div className="container">
          <div className="weather-card">
            <h2>
              <i className="fas fa-map-marker-alt"></i> 
              {weather ? ` ${weather.name}, Sri Lanka` : " Select a City"}
            </h2>
            
            <div className="weather-info">
              <div className="temp">
                <i className="fas fa-temperature-high"></i> 
                <span>{weather ? `${Math.round(weather.main.temp)}°C` : "--°C"}</span>
              </div>
              <div className="rain">
                <i className="fas fa-cloud-showers-heavy"></i> 
                <span>{weather ? `${weather.weather[0].description}` : "Condition"}</span>
              </div>
              <div className="wind">
                <i className="fas fa-wind"></i> 
                <span>{weather ? `${weather.wind.speed} m/s` : "Wind Speed"}</span>
              </div>
            </div>

            {weather && (
              <div style={{ marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
                <p><strong>Feels Like:</strong> {Math.round(weather.main.feels_like)}°C</p>
              </div>
            )}
          </div>

          <div className="alert-banner">
            <h2><i className="fas fa-exclamation-triangle"></i> Regional Alert</h2>
            <p>Monsoon warnings may be active for coastal provinces. Check local advisories.</p>
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