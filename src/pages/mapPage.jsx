// pages/mapPage.jsx — Community Reports Map with severity-colored markers
import { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// ── Severity config ──────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  high: {
    color: '#ef4444',
    shadow: 'rgba(239,68,68,0.5)',
    label: '🔴 High Risk',
    icon: '🚨',
  },
  medium: {
    color: '#f59e0b',
    shadow: 'rgba(245,158,11,0.5)',
    label: '🟡 Medium',
    icon: '⚠️',
  },
  low: {
    color: '#10b981',
    shadow: 'rgba(16,185,129,0.5)',
    label: '🟢 Normal',
    icon: '✅',
  },
};

const getSeverityConfig = (severity = 'medium') => {
  const key = severity.toLowerCase();
  return SEVERITY_CONFIG[key] || SEVERITY_CONFIG.medium;
};

// Build a custom colored SVG Leaflet icon
const buildIcon = (severity) => {
  const cfg = getSeverityConfig(severity);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${cfg.shadow}"/>
        </filter>
      </defs>
      <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 42 16 42 C16 42 32 28 32 16 C32 7.16 24.84 0 16 0Z"
        fill="${cfg.color}" filter="url(#shadow)"/>
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
    </svg>`;
  return L.divIcon({
    html: `<div style="animation:markerPulse 2s ease-in-out infinite;">${svg}</div>`,
    className: '',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
  });
};

const MapPage = () => {
  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const markersRef   = useRef([]);

  const [alertCount, setAlertCount]   = useState(0);
  const [filter, setFilter]           = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [allAlerts, setAllAlerts]     = useState([]);
  const filterRef = useRef('all');

  // Keep filterRef in sync so the Firestore callback can use latest value
  useEffect(() => { filterRef.current = filter; }, [filter]);

  // ── Draw markers filtered by current severity ────────────────────────────
  const drawMarkers = (alerts, activeFilter) => {
    if (!mapInstance.current) return;

    // Remove old markers
    markersRef.current.forEach(m => mapInstance.current.removeLayer(m));
    markersRef.current = [];

    // Only show reports that have been confirmed (district hit the alert threshold)
    const confirmedOnly = alerts.filter(a => a.status === 'confirmed');

    const filtered = activeFilter === 'all'
      ? confirmedOnly
      : confirmedOnly.filter(a => (a.severity || 'medium').toLowerCase() === activeFilter);

    filtered.forEach((alertData) => {
      if (!alertData.location?.lat || !alertData.location?.lng) return;

      const cfg         = getSeverityConfig(alertData.severity);
      const time        = alertData.createdAt
        ? new Date(alertData.createdAt.seconds * 1000).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
        : 'Unknown time';

      const marker = L.marker(
        [alertData.location.lat, alertData.location.lng],
        { icon: buildIcon(alertData.severity) }
      )
        .addTo(mapInstance.current)
        .bindPopup(`
          <div style="font-family:'Inter',sans-serif;min-width:220px;color:#1e293b;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
              <span style="font-size:1.4rem;">${cfg.icon}</span>
              <div>
                <div style="font-weight:700;font-size:1rem;color:#0f172a;">${alertData.title || 'Community Alert'}</div>
                <div style="font-size:0.75rem;color:#64748b;">${time}</div>
              </div>
            </div>
            <div style="background:#f8fafc;border-radius:8px;padding:10px;margin-bottom:8px;">
              <div style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:0.72rem;font-weight:700;
                background:${cfg.color}22;color:${cfg.color};margin-bottom:6px;">
                ${cfg.label}
              </div>
              ${alertData.district ? `<div style="font-size:0.82rem;color:#475569;margin-bottom:4px;">📍 <strong>District:</strong> ${alertData.district}</div>` : ''}
              ${alertData.loc ? `<div style="font-size:0.82rem;color:#475569;margin-bottom:4px;">🗺️ <strong>Location:</strong> ${alertData.loc}</div>` : ''}
              ${alertData.description ? `<div style="font-size:0.82rem;color:#64748b;margin-top:6px;line-height:1.4;">${alertData.description}</div>` : ''}
            </div>
          </div>
        `, { maxWidth: 280 });

      markersRef.current.push(marker);
    });
  };

  // ── Firestore realtime listener ──────────────────────────────────────────
  useEffect(() => {
    // Init map
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([7.8731, 80.7718], 8);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance.current);
    }

    const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const confirmedData = data.filter(a => a.status === 'confirmed');
      setAllAlerts(confirmedData);
      setAlertCount(confirmedData.length);
      drawMarkers(data, filterRef.current);
    }, (err) => console.error('Map Firestore error:', err));

    return () => {
      unsubscribe();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Re-draw markers when filter changes
  useEffect(() => {
    drawMarkers(allAlerts, filter);
  }, [filter]);

  const centerMap = () => {
    mapInstance.current?.setView([7.8731, 80.7718], 8);
  };

  const countBySeverity = (sev) =>
    allAlerts.filter(a => (a.severity || 'medium').toLowerCase() === sev).length;

  return (
    <>
      <style>{`
        @keyframes markerPulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.12); }
        }
        .filter-btn {
          padding: 8px 18px;
          border-radius: 99px;
          border: 1.5px solid transparent;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(30,41,59,0.7);
          color: #94a3b8;
        }
        .filter-btn:hover { opacity: 0.85; }
        .filter-btn.active-all    { background:rgba(99,102,241,0.2);border-color:#6366f1;color:#a5b4fc; }
        .filter-btn.active-high   { background:rgba(239,68,68,0.2);border-color:#ef4444;color:#fca5a5; }
        .filter-btn.active-medium { background:rgba(245,158,11,0.2);border-color:#f59e0b;color:#fcd34d; }
        .filter-btn.active-low    { background:rgba(16,185,129,0.2);border-color:#10b981;color:#6ee7b7; }
        .stat-pill {
          display:inline-flex;align-items:center;gap:6px;
          padding:6px 14px;border-radius:99px;font-size:0.8rem;font-weight:600;
        }
      `}</style>

      <section className="map-section">
        <div className="container">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="map-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <h1><i className="fas fa-map"></i> Community Reports Map</h1>
              <p className="subtext">Live alert zones reported by the community - updated in real time</p>
            </div>

            {/* Stats pills */}
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <span className="stat-pill" style={{ background:'rgba(99,102,241,0.15)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)' }}>
                📊 Total: {alertCount}
              </span>
              <span className="stat-pill" style={{ background:'rgba(239,68,68,0.15)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.3)' }}>
                🚨 High: {countBySeverity('high')}
              </span>
              <span className="stat-pill" style={{ background:'rgba(245,158,11,0.15)', color:'#fcd34d', border:'1px solid rgba(245,158,11,0.3)' }}>
                ⚠️ Medium: {countBySeverity('medium')}
              </span>
              <span className="stat-pill" style={{ background:'rgba(16,185,129,0.15)', color:'#6ee7b7', border:'1px solid rgba(16,185,129,0.3)' }}>
                ✅ Normal: {countBySeverity('low')}
              </span>
            </div>
          </div>

          {/* ── Filter bar ─────────────────────────────────────────────── */}
          <div style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
            {[
              { key:'all',    label:'🗺️ All Reports' },
              { key:'high',   label:'🚨 High Risk' },
              { key:'medium', label:'⚠️ Medium' },
              { key:'low',    label:'✅ Normal' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`filter-btn ${filter === key ? `active-${key}` : ''}`}
                onClick={() => setFilter(key)}
              >
                {label}
                {key !== 'all' && (
                  <span style={{ marginLeft:'4px', opacity:0.7 }}>({countBySeverity(key)})</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Map ────────────────────────────────────────────────────── */}
          <div className="map-wrapper" style={{ position:'relative' }}>
            <div
              id="map"
              ref={mapRef}
              style={{ width:'100%', height:'520px', borderRadius:'12px', zIndex:1 }}
            ></div>

            {/* Legend */}
            <div style={{
              position:'absolute', bottom:'20px', left:'20px', zIndex:1000,
              background:'rgba(15,23,42,0.92)', backdropFilter:'blur(12px)',
              borderRadius:'12px', padding:'12px 16px',
              border:'1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#94a3b8', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                Legend
              </div>
              {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                <div key={key} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px', fontSize:'0.8rem', color:'#cbd5e1' }}>
                  <span style={{ width:12, height:12, borderRadius:'50%', background:cfg.color, display:'inline-block', flexShrink:0 }}></span>
                  {cfg.label}
                </div>
              ))}
            </div>

            {/* Center button */}
            <div style={{ position:'absolute', bottom:'20px', right:'20px', zIndex:1000 }}>
              <button
                onClick={centerMap}
                style={{
                  padding:'10px 18px',
                  background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                  color:'white', border:'none', borderRadius:'8px',
                  cursor:'pointer', fontWeight:600, fontSize:'0.85rem',
                  display:'flex', alignItems:'center', gap:'6px',
                  boxShadow:'0 4px 15px rgba(99,102,241,0.3)',
                }}
              >
                <i className="fas fa-location-arrow"></i> Center Map
              </button>
            </div>

            {/* Empty state overlay */}
            {alertCount === 0 && (
              <div style={{
                position:'absolute', inset:0, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                background:'rgba(15,23,42,0.6)', borderRadius:'12px', zIndex:2,
              }}>
                <div style={{ fontSize:'3rem', marginBottom:'12px' }}>🗺️</div>
                <p style={{ color:'#94a3b8', fontSize:'1rem' }}>No community reports yet.</p>
                <p style={{ color:'#64748b', fontSize:'0.85rem' }}>Submit an alert to see it here!</p>
              </div>
            )}
          </div>

        </div>
      </section>
    </>
  );
};

export default MapPage;