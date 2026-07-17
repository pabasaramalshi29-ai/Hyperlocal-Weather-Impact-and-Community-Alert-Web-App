
import { useState, useEffect, useRef } from 'react';
import {
  submitDistrictReport,
  getTodayDistrictReportCount,
  SRI_LANKA_DISTRICTS,
} from '../utils/districtAlertService';

const ALERT_THRESHOLD = 3;

const SEVERITY_LEVELS = [
  {
    key: 'high',
    label: 'High Risk',
    icon: '🚨',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    border: '#ef4444',
    activeText: '#fca5a5',
  },
  {
    key: 'medium',
    label: 'Medium',
    icon: '⚠️',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    border: '#f59e0b',
    activeText: '#fcd34d',
  },
  {
    key: 'low',
    label: 'Normal',
    icon: '✅',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.15)',
    border: '#10b981',
    activeText: '#6ee7b7',
  },
];

// ── Inline styles (no extra CSS file needed) ─────────────────────────────────
const styles = {
  progressWrap: {
    maxWidth: '900px',
    margin: '0 auto 20px',
    background: 'rgba(30,41,59,0.8)',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '14px 18px',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '0.82rem',
    color: '#94a3b8',
  },
  progressBar: (pct) => ({
    height: '8px',
    borderRadius: '99px',
    background: '#1e293b',
    overflow: 'hidden',
  }),
  progressFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    borderRadius: '99px',
    background:
      pct >= 100
        ? 'linear-gradient(90deg,#10b981,#34d399)'
        : pct >= 66
        ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
        : 'linear-gradient(90deg,#6366f1,#818cf8)',
    transition: 'width 0.5s ease',
  }),
  emailBanner: {
    maxWidth: '900px',
    margin: '0 auto 22px',
    background: 'linear-gradient(135deg,rgba(16,185,129,0.18),rgba(52,211,153,0.10))',
    border: '1.5px solid #10b981',
    borderRadius: '14px',
    padding: '18px 22px',
    textAlign: 'center',
    color: '#fff',
    animation: 'fadeSlideIn 0.4s ease',
  },
  successBanner: {
    maxWidth: '900px',
    margin: '0 auto 22px',
    background: 'rgba(16,185,129,0.18)',
    border: '1px solid #10b981',
    borderRadius: '12px',
    padding: '14px',
    textAlign: 'center',
    color: '#fff',
  },
  selectWrapper: {
    position: 'relative',
    marginBottom: '18px',
  },
  select: {
    width: '100%',
    padding: '14px 16px 14px 42px',
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.95rem',
    appearance: 'none',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  selectIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6366f1',
    fontSize: '1rem',
    pointerEvents: 'none',
  },
  selectArrow: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    pointerEvents: 'none',
  },
};

// ── Central Coordinates of Sri Lanka Districts ──────────────────────────────
const DISTRICT_COORDS = {
  'Ampara': { lat: 7.3018, lng: 81.6747 },
  'Anuradhapura': { lat: 8.3114, lng: 80.4037 },
  'Badulla': { lat: 6.9934, lng: 81.0550 },
  'Batticaloa': { lat: 7.7102, lng: 81.6924 },
  'Colombo': { lat: 6.9271, lng: 79.8612 },
  'Galle': { lat: 6.0535, lng: 80.2117 },
  'Gampaha': { lat: 7.0840, lng: 80.0098 },
  'Hambantota': { lat: 6.1248, lng: 81.1185 },
  'Jaffna': { lat: 9.6615, lng: 80.0255 },
  'Kalutara': { lat: 6.5854, lng: 79.9607 },
  'Kandy': { lat: 7.2906, lng: 80.6337 },
  'Kegalle': { lat: 7.2513, lng: 80.3464 },
  'Kilinochchi': { lat: 9.3803, lng: 80.3792 },
  'Kurunegala': { lat: 7.4863, lng: 80.3647 },
  'Mannar': { lat: 8.9810, lng: 79.9044 },
  'Matale': { lat: 7.4675, lng: 80.6234 },
  'Matara': { lat: 5.9549, lng: 80.5550 },
  'Monaragala': { lat: 6.8719, lng: 81.3500 },
  'Mullaitivu': { lat: 9.2671, lng: 80.8142 },
  'Nuwara Eliya': { lat: 6.9497, lng: 80.7891 },
  'Polonnaruwa': { lat: 7.9403, lng: 81.0188 },
  'Puttalam': { lat: 8.0362, lng: 79.8283 },
  'Ratnapura': { lat: 6.7056, lng: 80.3847 },
  'Trincomalee': { lat: 8.5711, lng: 81.2335 },
  'Vavuniya': { lat: 8.7542, lng: 80.4982 }
};

const Report = () => {
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    district: '',
    file: null,
  });
  const [severity, setSeverity] = useState('medium'); // 'high' | 'medium' | 'low'
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailTriggered, setEmailTriggered] = useState(false);
  const [emailsCount, setEmailsCount] = useState(0);

  // District alert count tracking (live from Firestore)
  const [districtCount, setDistrictCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);

  // 📍 Coordinates selected from the map (Default: Kandy)
  const [lat, setLat] = useState(7.2906);
  const [lng, setLng] = useState(80.6337);

  const miniMapRef      = useRef(null);
  const miniMapInstance = useRef(null);
  const clickMarkerRef  = useRef(null);

  // Load current alert count and auto-spot the district on the map
  useEffect(() => {
    if (!formData.district) {
      setDistrictCount(0);
      return;
    }

    // Auto-center map on selected district coordinates
    const coords = DISTRICT_COORDS[formData.district];
    if (coords) {
      setLat(coords.lat);
      setLng(coords.lng);
      if (miniMapInstance.current) {
        miniMapInstance.current.setView([coords.lat, coords.lng], 10);
      }
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setLatLng([coords.lat, coords.lng]);
      }
    }

    setLoadingCount(true);
    getTodayDistrictReportCount(formData.district)
      .then((c) => setDistrictCount(c))
      .finally(() => setLoadingCount(false));
  }, [formData.district]);

  // 🗺️ Mini Map
  useEffect(() => {
    if (miniMapRef.current && !miniMapInstance.current) {
      miniMapInstance.current = L.map(miniMapRef.current).setView([7.2906, 80.6337], 7);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(miniMapInstance.current);

      clickMarkerRef.current = L.marker([7.2906, 80.6337]).addTo(miniMapInstance.current);

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

    if (!formData.district) {
      alert('Please select a district before submitting.');
      return;
    }

    setIsSubmitting(true);
    setEmailTriggered(false);

    try {
      // Merge this report into today's district cluster (same district + same
      // calendar day only). Confirms + emails automatically once it hits 3.
      const result = await submitDistrictReport({
        district:    formData.district,
        description: formData.description,
        severity,
        loc:         formData.location || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
      });

      if (result.justConfirmed) {
        setEmailTriggered(true);
        setEmailsCount(result.usersNotified || 0);
      }
      setDistrictCount(result.reportCount || 0);

      setSubmitted(true);
      setFormData({ location: '', description: '', district: '', file: null });
      setSeverity('medium'); // reset severity after submit

      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = '';

      setTimeout(() => {
        setSubmitted(false);
        setEmailTriggered(false);
      }, 6000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Something went wrong! Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress bar helpers
  const progressPct    = Math.min((districtCount / ALERT_THRESHOLD) * 100, 100);
  const remaining      = ALERT_THRESHOLD - districtCount;
  const showProgress   = !!formData.district && !loadingCount;

  return (
    <>
      {/* Inject keyframe animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .district-select:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .district-select option {
          background: #1e293b;
          color: #f1f5f9;
        }
      `}</style>

      <section className="report-section">
        <div className="container">
          <h1>
            <i className="fas fa-exclamation-circle"></i> Report an Alert
          </h1>

          {/* ── Email blast notification ───────────────────────────────── */}
          {emailTriggered && (
            <div style={styles.emailBanner}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📧</div>
              <strong style={{ fontSize: '1.1rem', color: '#34d399' }}>
                Community Alert Emails Sent!
              </strong>
              <p style={{ margin: '6px 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
                {emailsCount} registered resident{emailsCount !== 1 ? 's' : ''} in{' '}
                <strong style={{ color: '#fff' }}>{formData.district || 'this district'}</strong>{' '}
                have been notified about this alert cluster.
              </p>
            </div>
          )}

          {submitted && !emailTriggered && (
            <div style={styles.successBanner}>
              ✅ Alert submitted successfully! Thank you for helping your community.
            </div>
          )}
          {showProgress && (
            <div style={styles.progressWrap}>
              <div style={styles.progressLabel}>
                <span>
                  <i className="fas fa-map-marker-alt" style={{ marginRight: 6, color: '#6366f1' }}></i>
                  <strong style={{ color: '#e2e8f0' }}>{formData.district}</strong>
                  {' '}— Alert Progress
                </span>
                <span style={{ color: districtCount >= ALERT_THRESHOLD - 1 ? '#f59e0b' : '#64748b' }}>
                  {districtCount}/{ALERT_THRESHOLD} alerts today
                  {districtCount > 0 && ` · ${remaining} more to trigger email`}
                </span>
              </div>
              <div style={styles.progressBar(progressPct)}>
                <div style={styles.progressFill(progressPct)}></div>
              </div>
              {districtCount >= ALERT_THRESHOLD - 1 && districtCount < ALERT_THRESHOLD && (
                <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#f59e0b' }}>
                  ⚠️ One more alert in this district will trigger an email to all registered residents!
                </p>
              )}
            </div>
          )}

          {/* ── Main grid: form + map ─────────────────────────────────── */}
          <div
            className="report-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '30px',
              maxWidth: '900px',
              margin: '0 auto',
              alignItems: 'start',
            }}
          >
            {/* Left — form */}
            <form
              className="report-form"
              onSubmit={handleSubmit}
              style={{ width: '100%', maxWidth: 'none', margin: '0' }}
            >
              {/* District Dropdown */}
              <div style={styles.selectWrapper}>
                <span style={styles.selectIcon}>
                  <i className="fas fa-map"></i>
                </span>
                <select
                  className="district-select"
                  style={styles.select}
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                >
                  <option value="" disabled>Select District</option>

                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <span style={styles.selectArrow}>▼</span>
              </div>

              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display:'block', fontSize:'0.82rem', color:'#94a3b8', marginBottom:'10px', fontWeight:600, letterSpacing:'0.03em' }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginRight:6, color:'#f59e0b' }}></i>
                  ALERT SEVERITY
                </label>
                <div style={{ display:'flex', gap:'10px' }}>
                  {SEVERITY_LEVELS.map((sev) => {
                    const isActive = severity === sev.key;
                    return (
                      <button
                        key={sev.key}
                        type="button"
                        onClick={() => setSeverity(sev.key)}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: isActive ? `2px solid ${sev.border}` : '1.5px solid #334155',
                          background: isActive ? sev.bg : 'rgba(15,23,42,0.5)',
                          color: isActive ? sev.activeText : '#64748b',
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: isActive ? `0 0 12px ${sev.color}33` : 'none',
                          transform: isActive ? 'scale(1.04)' : 'scale(1)',
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{sev.icon}</span>
                        <span>{sev.label}</span>
                      </button>
                    );
                  })}
                </div>
                {/* Severity indicator bar */}
                <div style={{ marginTop:'8px', height:'3px', borderRadius:'99px', background:'#1e293b' }}>
                  <div style={{
                    height:'100%',
                    borderRadius:'99px',
                    width: severity === 'high' ? '100%' : severity === 'medium' ? '60%' : '25%',
                    background: severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#10b981',
                    transition: 'all 0.3s ease',
                  }}></div>
                </div>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  id="location"
                  placeholder=" "
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
                <label htmlFor="location">
                  <i className="fas fa-map-marker-alt"></i> Location
                </label>
              </div>

              {/* Description */}
              <div className="form-group">
                <textarea
                  id="description"
                  placeholder=" "
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                ></textarea>
                <label htmlFor="description">
                  <i className="fas fa-info-circle"></i> Description
                </label>
              </div>

              {/* Image upload */}
              <div className="form-group">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                />
                <label htmlFor="image">
                  <i className="fas fa-camera"></i> Upload Image (optional)
                </label>
              </div>

              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' }}>
                Selected Point:{' '}
                <span style={{ color: '#f43f5e' }}>
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
                ) : (
                  <><i className="fas fa-paper-plane"></i> Submit Alert</>
                )}
              </button>
            </form>

            {/* Right — mini map */}
            <div
              style={{
                background: '#1e293b',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #334155',
              }}
            >
              <label
                style={{
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  marginBottom: '10px',
                  display: 'block',
                }}
              >
                <i className="fas fa-map-pin"></i> Click on the map to mark the exact spot:
              </label>
              <div
                ref={miniMapRef}
                style={{
                  width: '100%',
                  height: '275px',
                  borderRadius: '8px',
                  border: '1px solid #475569',
                  zIndex: 1,
                }}
              ></div>

              {/* District info below map */}
              {formData.district && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: 'rgba(99,102,241,0.12)',
                    borderRadius: '8px',
                    border: '1px solid rgba(99,102,241,0.3)',
                    fontSize: '0.82rem',
                    color: '#a5b4fc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="fas fa-shield-alt"></i>
                  Reporting for <strong style={{ color: '#818cf8' }}>{formData.district}</strong> District
                  &nbsp;·&nbsp;
                  <span style={{ color: '#64748b' }}>
                    {districtCount}/{ALERT_THRESHOLD} alerts
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Report;