import { useEffect, useRef } from 'react';
import { db } from '../firebase'; 
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';

const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]); 

  useEffect(() => {
    
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
    });
    
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([7.8731, 80.7718], 8);

      // Dark Mode Style
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    }

    // 2. Retrieving Realtime Alerts from Firebase Firestore and Adding It to the Map
    const q = query(
      collection(db, "alerts"),
      where("status", "==", "confirmed"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!mapInstance.current) return;
      snapshot.forEach((doc) => {
  const alertData = doc.data();
  console.log("Alert Data:", alertData);
        if (alertData.location && alertData.location.lat && alertData.location.lng) {
          const { lat, lng } = alertData.location;
          const title = alertData.title || "Alert";
          const description = alertData.description || "";

          const customIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]});

          const marker = L.marker([lat, lng]).addTo(mapInstance.current)
            .addTo(mapInstance.current)
            .bindPopup(`
              <div style="color: #1e293b; font-family: sans-serif;">
                <h3 style="margin: 0 0 5px 0; color: #ef4444;">⚠️ ${title}</h3>
                <p style="margin: 0 0 5px 0;"><strong>Location:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
                <p style="margin: 0;">${description}</p>
              </div>
            `);
            console.log("Marker added at:", lat, lng); 
            markersRef.current.push(marker);

          markersRef.current.push(marker);
        }
      });
    }, (error) => {
      console.error("Error fetching map markers: ", error);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
setTimeout(() => {
  if (mapInstance.current) {
    mapInstance.current.invalidateSize();
  }
}, 500);
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