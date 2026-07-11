// pages/DistrictRegister.jsx
// ─────────────────────────────────────────────────────────────────────────────
// District Registration Page
// - Stats bar at top: total registered, active unique emails, per-district count
// - Form: Full Name, Email, District → saves to Firestore `users` collection
// - Live count updates in real-time via Firestore listener
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, onSnapshot, query, orderBy,
  doc, setDoc, serverTimestamp, where, getDocs,
} from 'firebase/firestore';
import { SRI_LANKA_DISTRICTS } from '../utils/districtAlertService';

const DistrictRegister = () => {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm]         = useState({ fullName: '', email: '', district: '' });
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);

  // ── Stats state (live from Firestore) ─────────────────────────────────────
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [activeEmails, setActiveEmails]       = useState(0);
  const [districtStats, setDistrictStats]     = useState({}); // { Kandy: 3, Colombo: 5, ... }
  const [topDistricts, setTopDistricts]       = useState([]); // top 5 districts

  // ── Real-time Firestore listener for stats ─────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const users = snap.docs.map(d => d.data());

      setTotalRegistered(users.length);

      // Count unique emails
      const uniqueEmails = new Set(users.map(u => (u.email || '').toLowerCase()).filter(Boolean));
      setActiveEmails(uniqueEmails.size);

      // Count per district
      const dMap = {};
      users.forEach(u => {
        if (u.district) {
          dMap[u.district] = (dMap[u.district] || 0) + 1;
        }
      });
      setDistrictStats(dMap);

      // Top 5 districts by count
      const sorted = Object.entries(dMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      setTopDistricts(sorted);
    }, err => console.error('Stats listener error:', err));

    return () => unsub();
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.fullName.trim())  e.fullName = 'Full name is required';
    if (!form.email.trim())     e.email    = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                e.email    = 'Please enter a valid email';
    if (!form.district)         e.district = 'Please select your district';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setAlreadyExists(false);

    try {
      // Check if email already registered
      const existing = await getDocs(
        query(collection(db, 'users'), where('email', '==', form.email.toLowerCase()))
      );

      if (!existing.empty) {
        setAlreadyExists(true);
        setSubmitting(false);
        return;
      }

      // Save to Firestore users collection (same one used by districtAlertService)
      const safeId = form.email.toLowerCase().replace(/[.#$[\]]/g, '_');
      await setDoc(doc(db, 'users', safeId), {
        name:      form.fullName.trim(),
        email:     form.email.toLowerCase(),
        district:  form.district,
        createdAt: serverTimestamp(),
        source:    'district-register-form',
      });

      setSuccess(true);
      setForm({ fullName: '', email: '', district: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const maxDistrictCount = topDistricts.length > 0 ? topDistricts[0][1] : 1;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dr-stat-card {
          background: rgba(30,41,59,0.7);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px 24px;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: fadeIn 0.4s ease both;
        }
        .dr-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .dr-input {
          width: 100%;
          padding: 14px 16px 14px 42px;
          background: rgba(15,23,42,0.7);
          border: 1.5px solid #334155;
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .dr-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .dr-input.err { border-color: #ef4444; }
        .dr-input option { background: #1e293b; color: #f1f5f9; }
        .dr-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .dr-err { color: #f87171; font-size: 0.78rem; margin-top: 4px; display: block; }
        .dr-submit {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(99,102,241,0.35);
          letter-spacing: 0.02em;
        }
        .dr-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.45);
        }
        .dr-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .district-bar-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 0.82rem;
        }
        .district-bar-bg {
          flex: 1;
          height: 8px;
          background: #1e293b;
          border-radius: 99px;
          overflow: hidden;
        }
        .district-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #6366f1, #a78bfa);
          transition: width 0.6s ease;
        }
      `}</style>

      <section className="report-section">
        <div className="container">

          {/* ── Page Title ──────────────────────────────────────────────── */}
          <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>
            <i className="fas fa-map-marker-alt" style={{ color: '#6366f1' }}></i>{' '}
            District Alert Registration
          </h1>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px', fontSize: '0.95rem' }}>
            Register to receive community alert emails when 3+ reports are filed in your district
          </p>

          {/* ── STATS BAR ───────────────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            maxWidth: '900px',
            margin: '0 auto 36px',
          }}>
            {/* Total Registered */}
            <div className="dr-stat-card" style={{ borderTop: '3px solid #6366f1' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#a5b4fc', lineHeight: 1 }}>
                {totalRegistered}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Registered
              </div>
              <div style={{ fontSize: '1.5rem', marginTop: '8px' }}>👥</div>
            </div>

            {/* Active Emails */}
            <div className="dr-stat-card" style={{ borderTop: '3px solid #10b981' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#6ee7b7', lineHeight: 1 }}>
                {activeEmails}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Emails
              </div>
              <div style={{ fontSize: '1.5rem', marginTop: '8px' }}>📧</div>
            </div>

            {/* Districts Covered */}
            <div className="dr-stat-card" style={{ borderTop: '3px solid #f59e0b' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fcd34d', lineHeight: 1 }}>
                {Object.keys(districtStats).length}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Districts Covered
              </div>
              <div style={{ fontSize: '1.5rem', marginTop: '8px' }}>🗺️</div>
            </div>

            {/* Selected district count */}
            <div className="dr-stat-card" style={{ borderTop: '3px solid #ef4444' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fca5a5', lineHeight: 1 }}>
                {form.district ? (districtStats[form.district] || 0) : '—'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {form.district ? `In ${form.district}` : 'Select District'}
              </div>
              <div style={{ fontSize: '1.5rem', marginTop: '8px' }}>📍</div>
            </div>
          </div>

          {/* ── Top Districts breakdown ───────────────────────────────── */}
          {topDistricts.length > 0 && (
            <div style={{
              maxWidth: '900px',
              margin: '0 auto 32px',
              background: 'rgba(30,41,59,0.6)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '20px 24px',
            }}>
              <h3 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '16px' }}>
                <i className="fas fa-chart-bar" style={{ marginRight: 8, color: '#6366f1' }}></i>
                Top Registered Districts
              </h3>
              {topDistricts.map(([district, count]) => (
                <div key={district} className="district-bar-wrap">
                  <span style={{ width: '110px', color: '#cbd5e1', fontWeight: 600, flexShrink: 0 }}>
                    {district}
                  </span>
                  <div className="district-bar-bg">
                    <div
                      className="district-bar-fill"
                      style={{ width: `${(count / maxDistrictCount) * 100}%` }}
                    ></div>
                  </div>
                  <span style={{ color: '#a5b4fc', fontWeight: 700, width: '28px', textAlign: 'right', flexShrink: 0 }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Registration Form ─────────────────────────────────────── */}
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>

            {/* Success banner */}
            {success && (
              <div style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1.5px solid #10b981',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'fadeIn 0.3s ease',
              }}>
                <span style={{ fontSize: '1.8rem' }}>✅</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#34d399' }}>Successfully Registered!</div>
                  <div style={{ fontSize: '0.83rem', color: '#64748b', marginTop: '2px' }}>
                    You'll receive email alerts when 3+ reports are filed in your district.
                  </div>
                </div>
              </div>
            )}

            {/* Already exists warning */}
            {alreadyExists && (
              <div style={{
                background: 'rgba(245,158,11,0.15)',
                border: '1.5px solid #f59e0b',
                borderRadius: '12px',
                padding: '14px 20px',
                marginBottom: '20px',
                color: '#fcd34d',
                fontSize: '0.88rem',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                animation: 'fadeIn 0.3s ease',
              }}>
                <span style={{ fontSize: '1.4rem' }}>⚠️</span>
                This email is already registered. Each email can only register once.
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{
                background: 'rgba(30,41,59,0.7)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '32px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <h2 style={{ marginBottom: '24px', fontSize: '1.2rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '8px', padding: '6px 10px', fontSize: '1rem' }}>📋</span>
                Register for Alerts
              </h2>

              {/* Full Name */}
              <div style={{ marginBottom: '20px' }}>
                <label className="dr-label" htmlFor="dr-fullname">
                  <i className="fas fa-user" style={{ marginRight: 6 }}></i> Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-user" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6366f1', fontSize: '0.9rem' }}></i>
                  <input
                    id="dr-fullname"
                    type="text"
                    className={`dr-input${errors.fullName ? ' err' : ''}`}
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
                {errors.fullName && <span className="dr-err"><i className="fas fa-exclamation-circle"></i> {errors.fullName}</span>}
              </div>

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label className="dr-label" htmlFor="dr-email">
                  <i className="fas fa-envelope" style={{ marginRight: 6 }}></i> Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6366f1', fontSize: '0.9rem' }}></i>
                  <input
                    id="dr-email"
                    type="email"
                    className={`dr-input${errors.email ? ' err' : ''}`}
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => { setForm({ ...form, email: e.target.value }); setAlreadyExists(false); }}
                  />
                </div>
                {errors.email && <span className="dr-err"><i className="fas fa-exclamation-circle"></i> {errors.email}</span>}
              </div>

              {/* District */}
              <div style={{ marginBottom: '28px' }}>
                <label className="dr-label" htmlFor="dr-district">
                  <i className="fas fa-map" style={{ marginRight: 6 }}></i> District You Live In
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-map-marker-alt" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6366f1', fontSize: '0.9rem', zIndex: 1 }}></i>
                  <select
                    id="dr-district"
                    className={`dr-input${errors.district ? ' err' : ''}`}
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    style={{ appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="">— Select your district —</option>
                    {SRI_LANKA_DISTRICTS.map(d => (
                      <option key={d} value={d}>
                        {d}{districtStats[d] ? ` (${districtStats[d]} registered)` : ''}
                      </option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                </div>
                {errors.district && <span className="dr-err"><i className="fas fa-exclamation-circle"></i> {errors.district}</span>}
                {form.district && districtStats[form.district] && (
                  <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#6366f1' }}>
                    <i className="fas fa-info-circle"></i>{' '}
                    {districtStats[form.district]} people already registered in {form.district}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" className="dr-submit" disabled={submitting}>
                {submitting
                  ? <><i className="fas fa-spinner fa-spin"></i> Registering...</>
                  : <><i className="fas fa-bell"></i> Register for Alerts</>
                }
              </button>

              <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.78rem', color: '#475569' }}>
                🔒 Your information is only used to send community weather alerts
              </p>
            </form>
          </div>

        </div>
      </section>
    </>
  );
};

export default DistrictRegister;
