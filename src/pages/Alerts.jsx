// pages/Alerts.jsx
import { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read the latest data from Firestore in real time
    const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        
        let formattedTime = "Just now";
        if (docData.createdAt) {
          const date = docData.createdAt.toDate();
          formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + date.toLocaleDateString();
        }

        return {
          id: doc.id,
          title: docData.title || "No Title",
          severity: docData.severity || "medium",
          loc: docData.loc || "Unknown Location",
          time: formattedTime,
          description: docData.description || "No description provided."
        };
      });

      setAlerts(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching realtime alerts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="alerts-section">
      <div className="container">
        <h1><i className="fas fa-bell"></i> Community Alerts</h1>
        
        {loading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading live alerts...</p>
        ) : alerts.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>No alerts reported yet.</p>
        ) : (
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className="alert-card">
                <div className="alert-header">
                  <h3>{alert.title}</h3>
                  <span className={`severity ${alert.severity}`}>
                    <i className="fas fa-flag"></i> {alert.severity}
                  </span>
                </div>
                <p><i className="fas fa-map-marker-alt"></i> {alert.loc}</p>
                <p><i className="fas fa-clock"></i> {alert.time}</p>
                <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>
                  {alert.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Alerts;