import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase'; 
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const MapPage = () => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]); 

  useEffect(() => {
    // 1. Initializing the map firstMap එක මුලින්ම Initialize කිරීම 
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([7.8731, 80.7718], 8);

      // Dark Mode Style
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    }

    // 2. Retrieving Realtime Alerts from Firebase Firestore and Adding It to the Map
    const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!mapInstance.current) return;

      // All old markers on the previous map will be removed (to avoid duplicates).
      markersRef.current.forEach(marker => mapInstance.current.removeLayer(marker));
      markersRef.current = [];

      // FEvery alert from Firebase is placed as a marker on the map.
      snapshot.forEach((doc) => {
        const alertData = doc.data();

        //Checks if the object contains location data (lat, lng)
        if (alertData.location && alertData.location.lat && alertData.location.lng) {
          const lat = alertData.location.lat;
          const lng = alertData.location.lng;
          const title = alertData.title || "Alert";
          const description = alertData.description || "";
          const type = alertData.type || alertData.severity || "Warning";

          // Creating a new Leaflet Marker
          const marker = L.marker([lat, lng])
            .addTo(mapInstance.current)
            .bindPopup(`
              <div style="color: #1e293b; font-family: sans-serif;">
                <h3 style="margin: 0 0 5px 0; font-size: 1.1rem; color: #ef4444;">⚠️ ${title}</h3>
                <p style="margin: 0 0 5px 0;"><strong>Type:</strong> ${type}</p>
                <p style="margin: 0; font-size: 0.9rem; color: #475569;">${description}</p>
              </div>
            `);

          // The marker is placed in the array so that it can be removed later.
          markersRef.current.push(marker);
        }
      });
    }, (error) => {
      console.error("Error fetching firebase map markers: ", error);
    });

    //When the component closes, the map and firebase listener are cleared.
    return () => {
      unsubscribe();
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