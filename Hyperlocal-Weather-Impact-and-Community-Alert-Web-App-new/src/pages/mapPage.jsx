// pages/MapPage.jsx
import { useEffect, useRef } from 'react';

const MapPage = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Simulate Google Maps load (in production, load actual Google Maps API)
    if (mapRef.current) {
      mapRef.current.style.background = 'linear-gradient(135deg, #1e3a5f, #0f172a)';
    }
  }, []);

  const centerMap = () => {
    alert('📍 Centering map on your location...');
  };

  return (
    <section className="map-section">
      <div className="container">
        <div className="map-header">
          <div>
            <h1><i className="fas fa-map"></i> Weather Map</h1>
            <p className="subtext">Track live alert zones and weather impact across your neighborhood.</p>
          </div>
        </div>
        <div className="map-wrapper">
          <div className="map-container">
            <div id="map" ref={mapRef}>
              {/* Map overlay with markers */}
              <div className="map-marker marker-danger" style={{ top: '30%', left: '25%' }} title="Flood Alert">
                <span></span>
                <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  ⚠️ Flood Alert
                </div>
              </div>
              <div className="map-marker marker-warning" style={{ top: '55%', left: '65%' }} title="Storm Warning">
                <span></span>
                <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  ⚡ Storm Warning
                </div>
              </div>
              <div className="map-marker marker-safe" style={{ top: '70%', left: '40%' }} title="Safe Zone">
                <span></span>
                <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  ✅ Safe Zone
                </div>
              </div>
              <div className="map-marker marker-warning" style={{ top: '20%', left: '75%' }} title="Fire Risk">
                <span></span>
                <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  🔥 Fire Risk
                </div>
              </div>
            </div>
            
            <div className="control-panel">
              <div className="panel-title"><i className="fas fa-sliders-h"></i><span>Live Controls</span></div>
              <div className="panel-item" onClick={() => alert('Filtering alerts by severity...')}>
                <i className="fas fa-filter"></i> Filter
              </div>
              <div className="panel-item" onClick={() => alert('Live updates enabled!')}>
                <i className="fas fa-sync-alt"></i> Refresh
              </div>
              <div className="panel-item" onClick={centerMap}>
                <i className="fas fa-location-arrow"></i> Center
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapPage;