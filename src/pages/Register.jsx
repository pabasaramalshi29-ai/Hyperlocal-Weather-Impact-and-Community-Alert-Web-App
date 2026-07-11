import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { SRI_LANKA_CITIES } from '../data/cities';
import { useLanguage } from '../components/LanguageContext'; 

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.city) { setError(t.errSelectCity); return; }
    if (form.password.length < 6) { setError(t.errPasswordShort); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name: form.name,
        email: form.email,
        city: form.city,
        createdAt: serverTimestamp()
      });
      navigate('/');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="report-section">
      <div className="container">
        <h1><i className="fas fa-user-plus"></i> {t.registerTitle}</h1>
        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" id="name" placeholder=" " value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <label htmlFor="name"><i className="fas fa-user"></i> {t.fullName}</label>
          </div>
          <div className="form-group">
            <input type="email" id="email" placeholder=" " value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <label htmlFor="email"><i className="fas fa-envelope"></i> {t.email}</label>
          </div>
          <div className="form-group">
            <input type="password" id="password" placeholder=" " value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <label htmlFor="password"><i className="fas fa-lock"></i> {t.passwordLabel}</label>
          </div>
          <div className="form-group">
            <select id="city" value={form.city} required
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(15,23,42,0.6)', color: '#e2e8f0', border: '1px solid #334155' }}>
              <option value="">{t.selectDistrict}</option>
              {SRI_LANKA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {error && <p style={{ color: '#f87171', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <><i className="fas fa-spinner fa-spin"></i> {t.creatingAccount}</> : <><i className="fas fa-user-plus"></i> {t.registerTitle}</>}
          </button>
          <p style={{ textAlign: 'center', marginTop: '12px', color: '#94a3b8' }}>
            {t.alreadyHaveAccount}<Link to="/login" style={{ color: '#60a5fa' }}>{t.loginLink}</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Register;