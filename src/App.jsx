import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // ← Footer import කරන්න
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#60a5fa',
        fontSize: '1.5rem',
        fontWeight: '600',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚡</div>
        <p>Loading Application...</p>
      </div>
    );
  }

  return (
    <Router>
      {/* Navbar - authenticated users පමණයි */}
      {isAuthenticated && <Navbar />}
      
      {/* Main Content */}
      <div style={{ minHeight: 'calc(100vh - 140px)' }}> {/* Footer එකට ඉඩ දෙන්න */}
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
      </div>

      {/* ✅ Footer - සෑම පිටුවකම පෙන්වයි (Login, SignUp ඇතුළුව) */}
      <Footer />
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