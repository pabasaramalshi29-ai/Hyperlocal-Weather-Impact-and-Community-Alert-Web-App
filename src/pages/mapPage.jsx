import { useEffect, useRef } from 'react';
import { db } from '../firebase'; // Firebase config එක import කරගන්න
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]); // පරණ markers clean කරලා අලුත් ඒවා දාන්න reference එකක්

  useEffect(() => {
    // 1. Map එක මුලින්ම Initialize කිරීම (ඔයාගේ මුල් කෝඩ් එකමයි)
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([7.8731, 80.7718], 8);

      // Dark Mode Style
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    }

    // 2. Firebase Firestore එකෙන් Realtime Alerts ලබාගෙන Map එකට එකතු කිරීම
    const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!mapInstance.current) return;

      // කලින් map එකේ තිබ්බ පරණ markers ඔක්කොම අයින් කරනවා (duplicates නොවෙන්න)
      markersRef.current.forEach(marker => mapInstance.current.removeLayer(marker));
      markersRef.current = [];

      // Firebase එකෙන් එන හැම alert එකක්ම map එකට Marker එකක් විදිහට දානවා
      snapshot.forEach((doc) => {
        const alertData = doc.data();

        // Object එක ඇතුලේ location data (lat, lng) තියෙනවද කියලා check කරනවා
        if (alertData.location && alertData.location.lat && alertData.location.lng) {
          const lat = alertData.location.lat;
          const lng = alertData.location.lng;
          const title = alertData.title || "Alert";
          const description = alertData.description || "";
          const type = alertData.type || alertData.severity || "Warning";

          // අලුත් Leaflet Marker එකක් හදනවා
          const marker = L.marker([lat, lng])
            .addTo(mapInstance.current)
            .bindPopup(`
              <div style="color: #1e293b; font-family: sans-serif;">
                <h3 style="margin: 0 0 5px 0; font-size: 1.1rem; color: #ef4444;">⚠️ ${title}</h3>
                <p style="margin: 0 0 5px 0;"><strong>Type:</strong> ${type}</p>
                <p style="margin: 0; font-size: 0.9rem; color: #475569;">${description}</p>
              </div>
            `);

          // පස්සේ අයින් කරන්න පුළුවන් වෙන්න marker එක array එකට දාගන්නවා
          markersRef.current.push(marker);
        }
      });
    }, (error) => {
      console.error("Error fetching firebase map markers: ", error);
    });

    // Component එක close වෙද්දී map එක සහ firebase listener එක clear කරනවා
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

  // ඔයාගේ මුල් UI එක (HTML/CSS) කිසිම වෙනසක් කර නැත.
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