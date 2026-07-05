// pages/Home.jsx
import { useState, useEffect } from 'react';

const Home = () => {
  const [location, setLocation] = useState('');
  const [searchMessage, setSearchMessage] = useState('');

  // 🌡️  Celsius (°C)  State 
  const [weatherData, setWeatherData] = useState({
    cityName: 'Colombo, LK', // Default ආරම්භක නගරය
    temp: '--°C',
    rain: '--% chance',
    wind: '-- km/h'
  });

  // 📍 
  useEffect(() => {
    const fetchLocalWeather = async () => {
      try {
        // 1. IP  Coordinates 
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();
        
        if (geoData.latitude && geoData.longitude) {
          const city = `${geoData.city}, ${geoData.country_code}`;
          
          // 2.  Coordinates  Google 
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,rain`
          );
          const weatherDataLive = await weatherRes.json();
          const current = weatherDataLive.current;

          // 3.  Celsius  km/h 
          setWeatherData({
            cityName: city,
            temp: `${Math.round(current.temperature_2m)}°C`,
            rain: `${current.relative_humidity_2m}% chance`,
            wind: `${Math.round(current.wind_speed_10m)} km/h`
          });
        }
      } catch (error) {
        console.error("Error fetching live weather:", error);
        // Fail-safe default values if geolocation fails
        setWeatherData({
          cityName: 'Colombo, LK',
          temp: '30°C',
          rain: '60% chance',
          wind: '12 km/h'
        });
      }
    };

    fetchLocalWeather();
  }, []);

  // 🔍 
  const handleSearch = async () => {
    if (location.trim()) {
      setSearchMessage(`Searching for weather in ${location}...`);
      
      try {
        // Geocoding API  Latitude/Longitude 
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (geoData.results && geoData.results.length > 0) {
          const result = geoData.results[0];
          
          
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${result.latitude}&longitude=${result.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,rain`
          );
          const weatherDataLive = await weatherRes.json();
          const current = weatherDataLive.current;

          setWeatherData({
            cityName: `${result.name}, ${result.country_code || ''}`,
            temp: `${Math.round(current.temperature_2m)}°C`,
            rain: `${current.relative_humidity_2m}% chance`,
            wind: `${Math.round(current.wind_speed_10m)} km/h`
          });
          setSearchMessage('');
        } else {
          setSearchMessage('Location not found. Try again.');
          setTimeout(() => setSearchMessage(''), 3000);
        }
      } catch (err) {
        console.error(err);
        setSearchMessage('Error searching location.');
        setTimeout(() => setSearchMessage(''), 3000);
      }

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
              {/* 🌡️  Celsius and km/h  */}
              <div className="temp"><i className="fas fa-thermometer-half"></i> <span>{weatherData.temp}</span></div>
              <div className="rain"><i className="fas fa-cloud-rain"></i> <span>{weatherData.rain}</span></div>
              <div className="wind"><i className="fas fa-wind"></i> <span>{weatherData.wind}</span></div>
            </div>
            <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '0.9rem' }}>
              <i className="fas fa-map-marker-alt"></i> {weatherData.cityName}
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