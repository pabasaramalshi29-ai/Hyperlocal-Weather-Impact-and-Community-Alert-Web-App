import { useLanguage } from '../components/LanguageContext';
import { useState } from 'react';

const Home = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🌟 Language Context එකෙන් 't' object එක ලබා ගැනීම
  // කලින් තිබ්බේ: const { t } = useLanguage();
const { lang, t } = useLanguage(); // 👈 lang එකත් මෙතනින් ගන්න

  const API_KEY = "dc8754a29ab20f1c66f1c660f4346f20"; 

  const handleSearch = async () => {
    if (!location.trim()) {
      setError(t.errorEmpty || 'Please enter a city name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location},LK&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();

      if (data.cod === 200) {
        setWeather(data);
      } else {
        setError(t.errorNotFound || 'City not found in Sri Lanka. Please try Colombo, Kandy, or Galle.');
        setWeather(null);
      }
    } catch (err) {
      setError(t.errorConn || 'Failed to connect to the weather service.');
    } finally {
      setLocation(''); // Search කළාට පසු Input එක Clear කිරීමට (Optional)
      setLoading(false);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          {/* 🌟 ප්‍රධාන මාතෘකා පරිවර්තනය */}
          <h1>{t.mainTitle}</h1>
          <p>{t.subTitle}</p>
          
          <div className="search-bar">
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading}>
              <i className="fas fa-search"></i> {loading ? "..." : t.searchBtn}
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
              {weather ? ` ${weather.name}, Sri Lanka` : ` ${t.selectCity}`}
            </h2>
            
            <div className="weather-info">
              <div className="temp">
                <i className="fas fa-temperature-high"></i> 
                <span>{weather ? `${Math.round(weather.main.temp)}°C` : "--°C"}</span>
              </div>
              <div className="rain">
                <i className="fas fa-cloud-showers-heavy"></i> 
                {/* API එකෙන් එන Description එක ඉංග්‍රීසියෙන්ම තැබීමට හෝ Condition ලේබලය මාරු කිරීමට */}
                <span>{weather ? `${weather.weather[0].description}` : t.condition}</span>
              </div>
              <div className="wind">
                <i className="fas fa-wind"></i> 
                <span>{weather ? `${weather.wind.speed} m/s` : t.windSpeed}</span>
              </div>
            </div>

            {weather && (
              <div style={{ marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <p><strong>{t.humidity || "Humidity"}:</strong> {weather.main.humidity}%</p>
                <p><strong>{t.feelsLike || "Feels Like"}:</strong> {Math.round(weather.main.feels_like)}°C</p>
              </div>
            )}
          </div>

          {/* 🌟 දකුණු පැත්තේ ඇති Alert බැනරය පරිවර්තනය */}
          <div className="alert-banner">
            <h2><i className="fas fa-exclamation-triangle"></i> {t.regionalAlert}</h2>
            <p>{t.alertDesc}</p>
            <button className="alert-btn" onClick={() => window.location.href = '/alerts'}>
              {t.viewDetails}
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;