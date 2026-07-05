import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FacebookLogin } from 'react-facebook-login';
import { useAuth } from '../context/AuthContext';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { isAuthenticated, handleGoogleLogin, handleFacebookLogin } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
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
      // Here you would typically send the data to your backend API
      // For now, we'll just store it locally
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.fullName,
        email: formData.email,
        provider: 'email',
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'email-token');

      // Redirect to home page
      window.location.href = '/';
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
              <FacebookLogin
        appId={import.meta.env.VITE_FACEBOOK_APP_ID || '1234567890'}
        autoLoad={false}
       fields="name,email,picture"
       callback={handleFacebookLogin}
      cssClass="facebook-signup-button"
      icon="fa-facebook"
      />
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

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                placeholder="Create a password"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'input-error' : ''}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
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