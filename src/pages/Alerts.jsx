// pages/Alerts.jsx
import { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase';
import {
  collection, onSnapshot, query, orderBy,
  deleteDoc, doc, where, getDocs, Timestamp,
} from 'firebase/firestore';

// ── How many days before an alert is auto-deleted ────────────────────────────
const EXPIRY_DAYS = 5;

// ── Severity display config ───────────────────────────────────────────────────
const SEVERITY_META = {
  high: { label: 'High Risk', icon: '🚨', cls: 'high' },
  medium: { label: 'Medium', icon: '⚠️', cls: 'medium' },
  low: { label: 'Normal', icon: '✅', cls: 'low' },
};
const getSev = (s = 'medium') => SEVERITY_META[s.toLowerCase()] || SEVERITY_META.medium;

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);   // id of card being deleted
  const [deleted, setDeleted] = useState([]);     // ids that just got deleted (for exit anim)
  const [filter, setFilter] = useState('all');  // 'all' | 'high' | 'medium' | 'low'
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // id of card requesting deletion confirmation

  // ── Auto-delete alerts older than EXPIRY_DAYS days ───────────────────────
  const purgeExpiredAlerts = useCallback(async () => {
    try {
      const cutoff = Timestamp.fromDate(
        new Date(Date.now() - EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      );
      const expired = query(
        collection(db, 'alerts'),
        where('createdAt', '<', cutoff)
      );
      const snap = await getDocs(expired);
      
      const deleteOps = snap.docs.map((d) => deleteDoc(doc(db, 'alerts', d.id)));
      await Promise.all(deleteOps);

      if (snap.size > 0) {
        console.log(`🗑️ Auto-deleted ${snap.size} alert(s) older than ${EXPIRY_DAYS} days.`);
      }
    } catch (err) {
      console.error('Auto-purge error:', err);
    }
  }, []);

  // ── Realtime listener ────────────────────────────────────────────────────
  useEffect(() => {
    // Run auto-purge once on mount
    purgeExpiredAlerts();

    const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();

      const data = snapshot.docs.map(docSnap => {
        const d = docSnap.data();

        // Compute time display + days remaining
        let formattedTime = 'Just now';
        let daysLeft = EXPIRY_DAYS;
        let ageLabel = '';

        if (d.createdAt) {
          const date = d.createdAt.toDate();
          const ageMs = now - date.getTime();
          const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
          daysLeft = Math.max(0, EXPIRY_DAYS - ageDays);
          formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            + ' · ' + date.toLocaleDateString('en-LK');
          ageLabel = ageDays === 0
            ? 'Today'
            : ageDays === 1
              ? '1 day ago'
              : `${ageDays} days ago`;
        }

        return {
          id: docSnap.id,
          title: d.title || 'Community Report',
          severity: d.severity || 'medium',
          loc: d.loc || 'Unknown Location',
          district: d.district || '',
          description: d.description || 'No description provided.',
          status: d.status || 'pending',
          reportCount: d.reportCount || 1,
          time: formattedTime,
          ageLabel,
          daysLeft,
        };
      });

      setAlerts(data);
      setLoading(false);
    }, (error) => {
      console.error('Firestore alerts error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [purgeExpiredAlerts]);

  // ── Manual delete ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeleting(id);
    setDeleted(prev => [...prev, id]); // trigger exit animation
    setConfirmDeleteId(null); // hide modal

    // Wait for the CSS fade-out, then delete from Firestore
    setTimeout(async () => {
      try {
        await deleteDoc(doc(db, 'alerts', id));
      } catch (err) {
        console.error('Delete error:', err);
        setDeleted(prev => prev.filter(x => x !== id));
      } finally {
        setDeleting(null);
      }
    }, 350);
  };

  // ── Filtered list ────────────────────────────────────────────────────────
  const displayed = filter === 'all'
    ? alerts
    : alerts.filter(a => (a.severity || 'medium').toLowerCase() === filter);

  const countOf = (sev) => alerts.filter(a => (a.severity || 'medium').toLowerCase() === sev).length;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes fadeSlideOut {
          to { opacity: 0; transform: translateX(40px) scale(0.96); max-height: 0; padding: 0; margin: 0; }
        }
        .alert-card-exit {
          animation: fadeSlideOut 0.35s ease forwards;
          overflow: hidden;
          pointer-events: none;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .alert-card-enter {
          animation: fadeSlideIn 0.3s ease both;
        }
        .delete-btn {
          padding: 6px 14px;
          background: transparent;
          border: 1.5px solid rgba(239,68,68,0.35);
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .delete-btn:hover {
          background: rgba(239,68,68,0.15);
          border-color: #ef4444;
          box-shadow: 0 0 8px rgba(239,68,68,0.2);
        }
        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .filter-pill {
          padding: 7px 16px;
          border-radius: 99px;
          border: 1.5px solid transparent;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(30,41,59,0.7);
          color: #64748b;
        }
        .filter-pill:hover { opacity: 0.8; }
        .fp-all    { border-color:#6366f1 !important; background:rgba(99,102,241,0.15) !important; color:#a5b4fc !important; }
        .fp-high   { border-color:#ef4444 !important; background:rgba(239,68,68,0.15) !important; color:#fca5a5 !important; }
        .fp-medium { border-color:#f59e0b !important; background:rgba(245,158,11,0.15) !important; color:#fcd34d !important; }
        .fp-low    { border-color:#10b981 !important; background:rgba(16,185,129,0.15) !important; color:#6ee7b7 !important; }
        .expiry-bar {
          height: 3px;
          border-radius: 99px;
          background: #1e293b;
          margin-top: 10px;
          overflow: hidden;
        }
        .expiry-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.4s ease;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15,23,42,0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: modalFadeIn 0.25s ease;
        }
        .modal-content {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          animation: modalSlideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <section className="alerts-section">
        <div className="container">

          {/* ── Page header ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ marginBottom: '4px' }}>
                <i className="fas fa-bell"></i> Community Alerts
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                <i className="fas fa-clock" style={{ marginRight: 5 }}></i>
                Alerts are automatically deleted after <strong style={{ color: '#f59e0b' }}>{EXPIRY_DAYS} days</strong>
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { sev: 'all', label: `All (${alerts.length})`, cls: 'fp-all' },
                { sev: 'high', label: `🚨 High (${countOf('high')})`, cls: 'fp-high' },
                { sev: 'medium', label: `⚠️ Medium (${countOf('medium')})`, cls: 'fp-medium' },
                { sev: 'low', label: `✅ Normal (${countOf('low')})`, cls: 'fp-low' },
              ].map(({ sev, label, cls }) => (
                <button
                  key={sev}
                  className={`filter-pill ${filter === sev ? cls : ''}`}
                  onClick={() => setFilter(sev)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content ─────────────────────────────────────────────── */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
              Loading live alerts...
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔔</div>
              <p style={{ fontSize: '1.1rem' }}>No alerts {filter !== 'all' ? `with "${filter}" severity` : 'reported'} yet.</p>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>Submit a report to see it here.</p>
            </div>
          ) : (
            <div className="alerts-list">
              {displayed.map((alert) => {
                const sev = getSev(alert.severity);
                const isExiting = deleted.includes(alert.id);
                const isDeleting = deleting === alert.id;

                // Days-left expiry bar: 5 days = 100%, 0 days = 0%
                const expiryPct = (alert.daysLeft / EXPIRY_DAYS) * 100;
                const expiryColor =
                  alert.daysLeft <= 1 ? '#ef4444' :
                    alert.daysLeft <= 2 ? '#f59e0b' : '#10b981';

                return (
                  <div
                    key={alert.id}
                    className={`alert-card alert-card-enter${isExiting ? ' alert-card-exit' : ''}`}
                    style={{
                      borderLeft: `4px solid ${alert.severity === 'high' ? '#ef4444' :
                        alert.severity === 'medium' ? '#f59e0b' : '#10b981'
                        }`,
                    }}
                  >
                    {/* Card header row */}
                    <div className="alert-header" style={{ alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0 }}>{alert.title}</h3>
                          <span className={`severity ${sev.cls}`}>
                            {sev.icon} {sev.label}
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: alert.status === 'confirmed' ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)',
                              color: alert.status === 'confirmed' ? '#34d399' : '#fbbf24',
                              border: `1px solid ${alert.status === 'confirmed' ? '#10b981' : '#f59e0b'}`,
                            }}
                          >
                            {alert.status === 'confirmed'
                              ? `✅ Confirmed · ${alert.reportCount} reports`
                              : `⏳ Pending · ${alert.reportCount}/3 reports today`}
                          </span>
                        </div>
                        {alert.district && (
                          <div style={{ fontSize: '0.78rem', color: '#6366f1', marginTop: '4px', fontWeight: 600 }}>
                            🗺️ {alert.district} District
                          </div>
                        )}
                      </div>

                      {/* Delete button */}
                      <button
                        className="delete-btn"
                        onClick={() => setConfirmDeleteId(alert.id)}
                        disabled={isDeleting}
                        title="Delete this alert"
                      >
                        {isDeleting
                          ? <><i className="fas fa-spinner fa-spin"></i> Deleting</>
                          : <><i className="fas fa-trash-alt"></i> Delete</>
                        }
                      </button>
                    </div>

                    {/* Meta */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
                      <p style={{ margin: 0 }}>
                        <i className="fas fa-map-marker-alt"></i> {alert.loc}
                      </p>
                      <p style={{ margin: 0 }}>
                        <i className="fas fa-clock"></i> {alert.time}
                      </p>
                      {alert.ageLabel && (
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>
                          <i className="fas fa-history"></i> {alert.ageLabel}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
                      {alert.description}
                    </p>

                    {/* Expiry countdown bar */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#475569', marginBottom: '4px' }}>
                        <span>
                          <i className="fas fa-hourglass-half" style={{ marginRight: 4 }}></i>
                          Auto-deletes in
                        </span>
                        <span style={{ color: expiryColor, fontWeight: 700 }}>
                          {alert.daysLeft === 0 ? 'Today' : `${alert.daysLeft} day${alert.daysLeft !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                      <div className="expiry-bar">
                        <div
                          className="expiry-fill"
                          style={{ width: `${expiryPct}%`, background: expiryColor }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ── Custom Confirmation Modal ───────────────────────────────── */}
      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗑️</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#e2e8f0' }}>Delete Report?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete this community report? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #334155',
                  background: 'rgba(15,23,42,0.4)',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.2)',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Alerts;