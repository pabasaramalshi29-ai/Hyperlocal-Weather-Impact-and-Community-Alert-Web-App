import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    
    // Ensure loading completes even if there's a delay
    const timer = setTimeout(checkAuth, 100);
    checkAuth(); // Also run immediately
    
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = (credentialResponse) => {
    try {
      // Decode JWT token to get user info
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const userData = JSON.parse(jsonPayload);
      const userInfo = {
        id: userData.sub,
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        provider: 'google',
      };

      setUser(userInfo);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('token', credentialResponse.credential);
    } catch (error) {
      console.error('Error processing Google login:', error);
    }
  };

  const handleFacebookLogin = (response) => {
    if (response.accessToken) {
      const userInfo = {
        id: response.userID,
        name: response.name,
        email: response.email,
        picture: response.picture?.data?.url,
        provider: 'facebook',
      };

      setUser(userInfo);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('token', response.accessToken);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, handleGoogleLogin, handleFacebookLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
