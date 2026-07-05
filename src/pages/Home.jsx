// pages/Home.jsx
import { useState, useEffect } from 'react';

const Home = () => {
  const [location, setLocation] = useState('');
  const [searchMessage, setSearchMessage] = useState('');

  // 🌡️ Celsius (°C), Precipitation, Humidity, Wind  State
  const [weatherData, setWeatherData] = useState({
    cityName: 'Colombo, LK', 
    temp: '30°C',
    precipitation: '10%', 
    humidity: '72%',     
    wind: '8 km/h'       
  });

  // 📍 
  useEffect(() => {
    const fetchLocalWeather = async () => {
      try {
        // IP එ
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();
        
      
        const lat = geoData.latitude || 6.9271;
        const lon = geoData.longitude || 79.8612;
        const currentCity = geoData.city ? `${geoData.city}, ${geoData.country_code}` : 'Colombo, LK';
        
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation`
        );
        const data = await weatherRes.json();

        if (data && data.current) {
          setWeatherData({
            cityName: currentCity,
            temp: `${Math.round(data.current.temperature_2m)}°C`,
            precipitation: data.current.precipitation > 0 ? `${Math.round(data.current.precipitation * 10)}%` : '0%',
            humidity: `${data.current.relative_humidity_2m}%`,
            wind: `${Math.round(data.current.wind_speed_10m)} km/h`
          });
        }
      } catch (error) {
        console.error("Error fetching live weather:", error);
        
        setWeatherData({
          cityName: 'Colombo, LK',
          temp: '29°C',
          precipitation: '15%',
          humidity: '78%',
          wind: '10 km/h'
        });
      }
    };

    fetchLocalWeather();
  }, []);

  // 🔍 (Rathnapura, Gampaha)
  const handleSearch = async () => {
    if (!location.trim()) {
      setSearchMessage('Please enter a location');
      setTimeout(() => setSearchMessage(''), 3000);
      return;
    }

    setSearchMessage(`Searching for weather in ${location}...`);
    
    try {
      // 🇱🇰  countrycodes=lk 
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&countrycodes=lk&limit=1`,
        {
          headers: {
            'User-Agent': 'HyperlocalWeatherApp/1.0'
          }
        }
      );
      const geoData = await geoRes.json();
      
      if (geoData && geoData.length > 0) {
        const result = geoData[0];
        
      
        const nameParts = result.display_name.split(',');
        const cleanName = `${nameParts[0]}, Sri Lanka`;
        
        // Open-Meteo 
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${result.lat}&longitude=${result.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation`
        );
        const data = await weatherRes.json();
        const current = data.current;

        setWeatherData({
          cityName: cleanName,
          temp: `${Math.round(current.temperature_2m)}°C`,
          precipitation: current.precipitation > 0 ? `${Math.round(current.precipitation * 10)}%` : '0%',
          humidity: `${current.relative_humidity_2m}%`,
          wind: `${Math.round(current.wind_speed_10m)} km/h`
        });
        setSearchMessage('');
      } else {
        // Nominatim එකෙන් නැත්නම් Open-Meteo Geocoding එකෙන් Backup සර්ච් එකක් කරනවා
        const backupRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
        );
        const backupData = await backupRes.json();

        if (backupData.results && backupData.results.length > 0) {
          const result = backupData.results[0];
          
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${result.latitude}&longitude=${result.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation`
          );
          const data = await weatherRes.json();
          const current = data.current;

          setWeatherData({
            cityName: `${result.name}, ${result.country_code || 'LK'}`,
            temp: `${Math.round(current.temperature_2m)}°C`,
            precipitation: current.precipitation > 0 ? `${Math.round(current.precipitation * 10)}%` : '0%',
            humidity: `${current.relative_humidity_2m}%`,
            wind: `${Math.round(current.wind_speed_10m)} km/h`
          });
          setSearchMessage('');
        } else {
          setSearchMessage('Location not found. Try again.');
          setTimeout(() => setSearchMessage(''), 3000);
        }
      }
    } catch (err) {
      console.error(err);
      setSearchMessage('Error searching location.');
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
              {/* 🌡️ Google Weather  Precipitation, Humidity, Wind  */}
              <div className="temp"><i className="fas fa-thermometer-half"></i> <span>{weatherData.temp}</span></div>
              <div className="rain"><i className="fas fa-cloud-rain"></i> <span>Precipitation: {weatherData.precipitation}</span></div>
              <div className="humidity" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '1.1rem' }}>
                <i className="fas fa-tint" style={{ color: '#38bdf8' }}></i> <span>Humidity: {weatherData.humidity}</span>
              </div>
              <div className="wind"><i className="fas fa-wind"></i> <span>Wind: {weatherData.wind}</span></div>
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