// pages/Report.jsx
import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Report = () => {
  const [formData, setFormData] = useState({ location: '', description: '', file: null });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📍 Map එකෙන් තෝරාගන්නා Coordinates (Default: Kandy)
  const [lat, setLat] = useState(7.2906);
  const [lng, setLng] = useState(80.6337);

  const miniMapRef = useRef(null);
  const miniMapInstance = useRef(null);
  const clickMarkerRef = useRef(null);

  // Report පිටුවේ ලස්සනට Mini Map එකක් සෑදීම
  useEffect(() => {
    if (miniMapRef.current && !miniMapInstance.current) {
      miniMapInstance.current = L.map(miniMapRef.current).setView([7.2906, 80.6337], 7);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(miniMapInstance.current);

      // Default marker එකක් දානවා
      clickMarkerRef.current = L.marker([7.2906, 80.6337]).addTo(miniMapInstance.current);

      // 🔴 සිතියම ක්ලික් කරද්දී coordinates වෙනස් කර marker එක එතනට ගන්නවා
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
      // 🚀 Firestore එකට දත්ත යැවීම (දැන් map එකෙන් ක්ලික් කරපු සැබෑ ස්ථානයත් එක්කම යනවා)
      await addDoc(collection(db, "alerts"), {
        title: "Community Report",
        loc: formData.location,               // ඔයා ටයිප් කරන ලොකේෂන් එක
        description: formData.description,
        severity: "medium",                   // Default severity
        location: {
          lat: parseFloat(lat),               // මැප් එකෙන් ගත්තු Latitude එක
          lng: parseFloat(lng)                // මැප් එකෙන් ගත්තු Longitude එක
        },
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
      setFormData({ location: '', description: '', file: null });
      
      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Something went wrong!");
    } finally {
      setIsSubmitting(false);
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

        {/* 🛠️ ඔයාගේ UI එක එහෙමම තියාගෙන Grid එකක් මඟින් දකුණු පැත්තෙන් මැප් එක දමා ඇත */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '900px', margin: '0 auto', alignItems: 'start' }}>
          
          {/* වම් පැත්ත: ඔයාගේ පරණ ලස්සන Form එක */}
          <form className="report-form" onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 'none', margin: '0' }}>
            <div className="form-group">
              <input 
                type="text" 
                id="location" 
                placeholder=" " 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required 
              />
              <label htmlFor="location">
                <i className="fas fa-map-marker-alt"></i> Location
              </label>
            </div>
            
            <div className="form-group">
              <textarea 
                id="description" 
                placeholder=" "
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              ></textarea>
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

          {/* දකුණු පැත්ත: අලුතින් එකතු කල Mini Map එක */}
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