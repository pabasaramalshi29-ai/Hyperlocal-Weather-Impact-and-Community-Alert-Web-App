import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLoginButton from '../components/FacebookLoginButton';
import { useAuth } from '../context/AuthContext';
import { saveUserToFirestore, SRI_LANKA_DISTRICTS } from '../utils/districtAlertService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './SignUp.css';


const SignUp = () => {
  const navigate = useNavigate();
  const { isAuthenticated, handleGoogleLogin, handleFacebookLogin, loginUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    district: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.district) {
      newErrors.district = 'Please select your district';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Check if user already exists
      const safeId = formData.email.replace(/[.#$[\]]/g, '_');
      const docRef = doc(db, 'users', safeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setErrors({ email: 'An account with this email address already exists. Please sign in.' });
        setSubmitting(false);
        return;
      }

      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.fullName,
        email: formData.email,
        district: formData.district,
        provider: 'email',
      };

      // Save to localStorage and update auth state
      loginUser(userData);

      // 🔥 Save to Firestore so the alert service can find this user by district
      await saveUserToFirestore({
        name:     formData.fullName,
        email:    formData.email,
        district: formData.district,
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating account:', error);
      setErrors({ submit: 'Failed to create account. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="signup-header">
          <h1>HyperWeather</h1>
          <p>Join Our Community</p>
        </div>

        <div className="signup-content">
          <h2>Create Your Account</h2>
          <p className="subtitle">Get started with weather alerts in seconds</p>

          <div className="oauth-buttons">
            <div className="google-signup-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log('Login Failed')}
                theme="filled_blue"
                size="large"
                width="100%"
              />
            </div>

            <div className="facebook-signup-wrapper">
              <FacebookLoginButton onLogin={handleFacebookLogin} />
            </div>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            {errors.submit && <div className="error-message">{errors.submit}</div>}

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? 'input-error' : ''}
                placeholder="Enter your full name"
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                placeholder="Enter your email"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'input-error' : ''}
                  placeholder="Password"
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  placeholder="Confirm"
                />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* District Dropdown */}
            <div className="form-group">
              <label htmlFor="district">
                <i className="fas fa-map" style={{ marginRight: '6px', color: '#6366f1' }}></i>
                Your District
              </label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={errors.district ? 'input-error' : ''}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(15,23,42,0.8)',
                  border: errors.district ? '1px solid #ef4444' : '1px solid #334155',
                  borderRadius: '8px',
                  color: formData.district ? '#fff' : '#64748b',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="" style={{ color: '#64748b', background: '#1e293b' }}>— Select your district —</option>
                {SRI_LANKA_DISTRICTS.map((d) => (
                  <option key={d} value={d} style={{ background: '#1e293b', color: '#f1f5f9' }}>{d}</option>
                ))}
              </select>
              {errors.district && <span className="field-error">{errors.district}</span>}
              <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                📧 You will receive community alerts for your district when 3+ reports are filed.
              </small>
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className={errors.agreeTerms ? 'input-error' : ''}
              />
              <label htmlFor="agreeTerms">
                I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
              </label>
              {errors.agreeTerms && <span className="field-error">{errors.agreeTerms}</span>}
            </div>

            <button type="submit" className="signup-btn" disabled={submitting}>
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <a href="/login">Sign in here</a>
          </p>
        </div>

        <div className="signup-footer">
          <p>Secure and private • No spam • Cancel anytime</p>
        </div>
      </div>

      <div className="signup-background">
        <div className="weather-icon">☁️</div>
        <div className="weather-icon">🌧️</div>
        <div className="weather-icon">⛈️</div>
      </div>
    </div>
  );
};

export default SignUp;