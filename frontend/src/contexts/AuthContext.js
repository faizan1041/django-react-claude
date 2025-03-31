import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if token needs refresh
        const decodedToken = jwt_decode(accessToken);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          await refreshAccessToken();
        } else {
          await fetchUserProfile(accessToken);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await api.get('/auth/users/me/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data);
    } catch (error) {
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await api.post('/auth/jwt/refresh/', { refresh: refreshToken });
      localStorage.setItem('accessToken', response.data.access);
      await fetchUserProfile(response.data.access);
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/jwt/create/', { email, password });
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      await fetchUserProfile(response.data.access);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data || { detail: 'Login failed. Please try again.' });
      throw error;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      await api.post('/auth/users/', userData);
      return true;
    } catch (error) {
      setError(error.response?.data || { detail: 'Registration failed. Please try again.' });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
  };

  // API request interceptor for token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If error is not 401 or request has already been retried, reject
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }
      
      // Mark request as retried
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        await refreshAccessToken();
        
        // Retry original request with new token
        const accessToken = localStorage.getItem('accessToken');
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout and redirect
        logout();
        return Promise.reject(refreshError);
      }
    }
  );

  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    refreshAccessToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};