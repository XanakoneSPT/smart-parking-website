import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      const token = sessionStorage.getItem('auth_token');
      const userInfo = sessionStorage.getItem('user_info');
      
      if (token && userInfo) {
        try {
          const parsedUser = JSON.parse(userInfo);
          // Only allow users with admin role
          if (parsedUser.is_admin) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // Clear non-admin user data
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('user_info');
          }
        } catch (error) {
          console.error('Error parsing user info:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    // Only allow admin users
    if (!userData.is_admin) {
      throw new Error('Access denied. Admin access required.');
    }
    
    // Store auth data in sessionStorage (cleared when browser is closed)
    sessionStorage.setItem('auth_token', token);
    sessionStorage.setItem('user_info', JSON.stringify(userData));
    
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_info');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 