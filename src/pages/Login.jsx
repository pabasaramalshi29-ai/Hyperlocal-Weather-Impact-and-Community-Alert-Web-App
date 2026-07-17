import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, handleGoogleLogin, loginUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const safeId = email.trim().toLowerCase().replace(/[.#$[\]]/g, '_');
      const userRef = doc(db, 'users', safeId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        loginUser({
          id: userSnap.id,
          name: data.name || 'Community Member',
          email: data.email || email.trim(),
          district: data.district || '',
          provider: 'email',
        });
        navigate('/');
      } else {
        setError('Account not found. Please sign up first.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>HyperWeather</h1>
          <p>Hyperlocal Weather Impact & Community Alert</p>
        </div>

        <div className="login-content">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to your account to continue</p>

          <div className="oauth-buttons">
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log('Login Failed')}
                theme="filled_blue"
                size="large"
                width="100%"
              />
            </div>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <form onSubmit={handleSubmit} className="email-login" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
                {error}
              </div>
            )}
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="signup-link">
            Don't have an account? <a href="/signup">Sign up here</a>
          </p>
        </div>

        <div className="login-footer">
          <p>Stay updated with real-time weather alerts</p>
        </div>
      </div>

      <div className="login-background">
        <div className="weather-icon">⛈️</div>
        <div className="weather-icon">🌊</div>
        <div className="weather-icon">🌪️</div>
        <div className="weather-icon">❄️</div>
        <div className="weather-icon">🌤️</div>
      </div>
    </div>
  );
};

export default Login;