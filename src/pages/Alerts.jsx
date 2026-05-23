// pages/Alerts.jsx
import { useEffect, useState } from 'react';
import { db } from '../firebase'; // Firebase config එක import කරගන්න
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Alerts = () => {
  // Firebase එකෙන් එන alerts save කරගන්න state එකක්
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 'alerts' collection එකෙන් අලුත්ම ඒවා උඩට එන විදිහට query එක හදනවා
    const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"));
    
    // Realtime සන්නිවේදනය (onSnapshot) ආරම්භ කිරීම
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAlerts = snapshot.forEach ? [] : [];
      
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        
        // වෙලාව ලස්සනට පේන්න හදාගන්න එක (createdAt එක Firebase timestamp එකක් නිසා)
        let formattedTime = "Just now";
        if (docData.createdAt) {
          const date = docData.createdAt.toDate();
          formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + date.toLocaleDateString();
        }

        return {
          id: doc.id,
          title: docData.title || "No Title",
          severity: docData.severity || "medium", // Firebase එකේ severity නැත්නම් default medium වැටේ
          loc: docData.loc || (docData.location ? `${docData.location.lat.toFixed(2)}, ${docData.location.lng.toFixed(2)}` : "Unknown Location"),
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

    // Component එක close වෙද්දී connection එක අයින් කරන්න
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
            {/* මෙතන ඔයාගේ කලින් තිබ්බ HTML Structure එකමයි තියෙන්නේ, alertData වෙනුවට alerts use කරලා තියෙන්නේ */}
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