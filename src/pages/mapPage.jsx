import { useEffect, useRef } from 'react';

const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    
    if (mapRef.current && !mapInstance.current) {
      
      
      mapInstance.current = L.map(mapRef.current).setView([7.8731, 80.7718], 8);

      //Dark Mode Style 
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      // Marker 
      L.marker([7.2906, 80.6337])
        .addTo(mapInstance.current)
        .bindPopup('<b>Flood Alert!</b><br>Kandy Area.')
        .openPopup();
    }

    // Component  clear 
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const centerMap = () => {
    if (mapInstance.current) {
      mapInstance.current.setView([7.8731, 80.7718], 8);
    }
  };

  return (
    <section className="map-section">
      <div className="container">
        <div className="map-header">
          <div>
            <h1><i className="fas fa-map"></i> Weather Map</h1>
            <p className="subtext">Track live alert zones and weather impact.</p>
          </div>
        </div>
        <div className="map-wrapper" style={{ position: 'relative' }}>
          <div 
            id="map" 
            ref={mapRef} 
            style={{ width: '100%', height: '500px', borderRadius: '12px', zIndex: 1 }}
          ></div>
          
          <div className="control-panel" style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000 }}>
            <button 
              onClick={centerMap}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#1e293b', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-location-arrow"></i> Center Map
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapPage;