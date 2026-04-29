// pages/Alerts.jsx
const Alerts = () => {
  const alertData = [
    { id: 1, title: "Flood Warning", severity: "high", loc: "Downtown", time: "2 hours ago", description: "Heavy rainfall has caused rising water levels near Main St." },
    { id: 2, title: "Power Outage", severity: "medium", loc: "Residential Zone", time: "5 hours ago", description: "Crews are working to restore power to affected areas." },
    { id: 3, title: "Heavy Rain", severity: "low", loc: "City Center", time: "1 day ago", description: "Expect continued rainfall throughout the week." },
    { id: 4, title: "High Wind Warning", severity: "high", loc: "Coastal Area", time: "30 minutes ago", description: "Gusts up to 50mph expected. Secure outdoor objects." }
  ];

  return (
    <section className="alerts-section">
      <div className="container">
        <h1><i className="fas fa-bell"></i> Community Alerts</h1>
        <div className="alerts-list">
          {alertData.map(alert => (
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
      </div>
    </section>
  );
};

export default Alerts;