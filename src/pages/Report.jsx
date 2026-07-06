// pages/Report.jsx
import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SRI_LANKA_CITIES } from '../data/cities';

const Report = () => {
  const [formData, setFormData] = useState({ location: '', description: '', file: null });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📍 Coordinates selected from the map (Default: Kandy)
  const [lat, setLat] = useState(7.2906);
  const [lng, setLng] = useState(80.6337);

  const miniMapRef = useRef(null);
  const miniMapInstance = useRef(null);
  const clickMarkerRef = useRef(null);

  // Creating a beautiful Mini Map on the Report page
  useEffect(() => {
    if (miniMapRef.current && !miniMapInstance.current) {
      miniMapInstance.current = L.map(miniMapRef.current).setView([7.2906, 80.6337], 7);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(miniMapInstance.current);
// Insert a default marker
      clickMarkerRef.current = L.marker([7.2906, 80.6337]).addTo(miniMapInstance.current);

      // 🔴When you click on the map, the coordinates change and the marker is placed there.
      miniMapInstance.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setLat(lat);
        setLng(lng);
        if (clickMarkerRef.current) {
          clickMarkerRef.current.setLatLng([lat, lng]);
        }
      });
    }

    return () => {
      if (miniMapInstance.current) {
        miniMapInstance.current.remove();
        miniMapInstance.current = null;
      }
    };
  }, []);

 const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log("දත්ත යැවීමට උත්සාහ කරයි...");
      const docRef = await addDoc(collection(db, "alerts"), {
        title: "Community Report",
        description: formData.description,
        location: { lat, lng },
        locationName: formData.location,
        status: "pending", 
        reportCount: 1,    
        severity: "medium", 
        createdAt: serverTimestamp(),
      });
      console.log("සාර්ථකයි! Document ID:", docRef.id);
      
      setSubmitted(true);
      setFormData({ location: '', description: '', file: null });
      setTimeout(() => setSubmitted(false), 3000);
      
    }catch (error) {
  console.log("Error object:", error);
  alert("ඇත්තටම දත්ත යැවීමට බැරි වුණේ මේ හේතුව නිසා: " + error.message);

    } finally {
      setIsSubmitting(false); // මේක අනිවාර්යයෙන්ම වැදගත්
      console.log("Submitting process finished.");
    }
  };
  return (
    <section className="report-section">
      <div className="container">
        <h1><i className="fas fa-exclamation-circle"></i> Report an Alert</h1>
        
        {submitted && (
          <div style={{ 
            maxWidth: '900px', 
            margin: '0 auto 24px', 
            background: 'rgba(16, 185, 129, 0.2)', 
            padding: '16px', 
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #10b981',
            color: '#fff'
          }}>
            ✅ Alert submitted successfully! Thank you for helping your community.
          </div>
        )}

        {/* 🛠️The UI has been kept the same and the map has been placed on the right side using a grid. */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '900px', margin: '0 auto', alignItems: 'start' }}>
          
          {/* Left side form */}
          <form className="report-form" onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 'none', margin: '0' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
  <label style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
    <i className="fas fa-map-marker-alt"></i> Location
  </label>
  
  <select 
    onChange={(e) => setFormData({...formData, location: e.target.value})}
    required
    style={{ padding: '10px', borderRadius: '8px', width: '100%' }}
  >
    <option value="">Select a City</option>
    {SRI_LANKA_CITIES.map(city => (
      <option key={city} value={city}>{city}</option>
    ))}
  </select>
</div>
            <div className="form-group">
              <textarea 
                id="description" 
                placeholder=" "
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <label htmlFor="description">
                <i className="fas fa-info-circle"></i> Description
              </label>
            </div>
            <div className="form-group">
              <input 
                type="file" 
                id="image" 
                accept="image/*" 
                onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
              />
              <label htmlFor="image">
                <i className="fas fa-camera"></i> Upload Image (optional)
              </label>
            </div>

            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' }}>
              Selected Point: <span style={{ color: '#f43f5e' }}>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
            </div>
            
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <> <i className="fas fa-spinner fa-spin"></i> Submitting...</>
              ) : (
                <> <i className="fas fa-paper-plane"></i> Submit Alert</>
              )}
            </button>
          </form>

          {/*Right side Mini Map */}
          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '10px', display: 'block' }}>
              <i className="fas fa-map-pin"></i> Click on the map to mark the exact spot:
            </label>
            <div 
              ref={miniMapRef} 
              style={{ width: '100%', height: '275px', borderRadius: '8px', border: '1px solid #475569', zIndex: 1 }}
            ></div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Report;