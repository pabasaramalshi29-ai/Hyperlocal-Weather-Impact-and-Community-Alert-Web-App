// pages/Alerts.jsx
import { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { SRI_LANKA_CITIES } from '../data/cities';

const citiesList = ["All", ...SRI_LANKA_CITIES];
<select >
  <option value="All">All</option>
  {SRI_LANKA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
</select>

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        reportCount: doc.data().reportCount || 1,
        status: doc.data().status || "pending"
      }));
      setAlerts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const confirmAlert = async (id, currentCount) => {
    const newCount = currentCount + 1;
    await updateDoc(doc(db, "alerts", id), {
      reportCount: newCount,
      status: newCount >= 3 ? "confirmed" : "pending" // 3ක් වුනොත් Confirmed වේ[cite: 1]
    });
  };

  return (
    <section className="alerts-section">
      <div className="container">
        <h1>Community Alerts</h1>
        <div className="alerts-list">
          {alerts.map(alert => (
           <div key={alert.id} className={`alert-card ${alert.status}`}>
  <h3>{alert.title} - {alert.status.toUpperCase()}</h3>
  <p style={{ color: '#cbd5e1', marginBottom: '5px' }}>{alert.description}</p>
  
  {/* Location එක පෙන්වීම */}
  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
  <i className="fas fa-map-marker-alt"></i> 
  Location: {alert.locationName || (alert.location ? `${alert.location.lat.toFixed(2)}, ${alert.location.lng.toFixed(2)}` : "Unknown")}
</p>
  {alert.status === 'pending' && (
    <button onClick={() => confirmAlert(alert.id, alert.reportCount)}>
      <i className="fas fa-check-circle"></i> Verify this Disaster ({alert.reportCount}/3)
    </button>
  )}
</div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Alerts;