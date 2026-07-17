import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ParticleCanvas from './components/ParticleCanvas';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import MapPage from './pages/mapPage';
import Report from './pages/Report';
import DistrictRegister from './pages/DistrictRegister';
import './App.css';

// ProtectedRoute component to check authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  console.log('AppContent rendering - loading:', loading, 'isAuthenticated:', isAuthenticated);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(14,165,233,0.12) 0%, transparent 60%), #020817',
        color: '#38bdf8',
        fontSize: '1.2rem',
        fontWeight: '600',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{ fontSize: '3.5rem', animation: 'none' }}>⛈️</div>
        <p style={{ letterSpacing: '0.5px' }}>Loading HyperWeather…</p>
      </div>
    );
  }

  return (
    <Router>
      {isAuthenticated && <ParticleCanvas />}
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route
          path="/district-register"
          element={
            <ProtectedRoute>
              <DistrictRegister />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890.apps.googleusercontent.com';

  console.log('App rendered, Google Client ID:', googleClientId);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;