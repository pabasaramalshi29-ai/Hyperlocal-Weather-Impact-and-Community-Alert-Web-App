import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, handleGoogleLogin } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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

          <div className="email-login">
            <input type="email" placeholder="Enter your email" />
            <input type="password" placeholder="Enter your password" />
            <button className="login-btn">Sign In</button>
          </div>

          <p className="signup-link">
            Don't have an account? <a href="/signup">Sign up here</a>
          </p>
        </div>

        <div className="login-footer">
          <p>Stay updated with real-time weather alerts</p>
        </div>
      </div>

      <div className="login-background">
        <div className="weather-icon">☁️</div>
        <div className="weather-icon">🌧️</div>
        <div className="weather-icon">⛈️</div>
      </div>
    </div>
  );
};

export default Login;