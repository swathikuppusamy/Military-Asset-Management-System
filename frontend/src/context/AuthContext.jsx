import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create the context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await authAPI.verifyToken();
          if (response.data.status === 'success') {
            setUser(response.data.data.user);
            setToken(storedToken);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.data.status === 'success') {
        const { token: newToken, data } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(data.user);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Network error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.signup(userData);
      
      if (response.data.status === 'success') {
        const { token: newToken, data } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(data.user);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Signup failed' 
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Network error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};