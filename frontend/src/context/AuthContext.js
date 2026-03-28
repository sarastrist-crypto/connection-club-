import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  // null = checking, false = not authenticated, object = authenticated
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      // If access token expired, try to refresh
      if (error.response?.status === 401) {
        try {
          await axios.post(`${API_URL}/api/auth/refresh`, {}, {
            withCredentials: true
          });
          // Retry the me request after refresh
          const retryResponse = await axios.get(`${API_URL}/api/auth/me`, {
            withCredentials: true
          });
          setUser(retryResponse.data);
          return;
        } catch (refreshError) {
          // Refresh also failed, user is not authenticated
          setUser(false);
        }
      } else {
        setUser(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    setUser(response.data);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await axios.post(
      `${API_URL}/api/auth/register`,
      { name, email, password },
      { withCredentials: true }
    );
    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(false);
  };

  const handleGoogleAuth = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const processGoogleSession = async (sessionId) => {
    const response = await axios.post(
      `${API_URL}/api/auth/session`,
      { session_id: sessionId },
      { withCredentials: true }
    );
    setUser(response.data);
    return response.data;
  };

  const refreshAuth = async () => {
    await checkAuth();
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    handleGoogleAuth,
    processGoogleSession,
    refreshAuth,
    isAuthenticated: !!user && user !== false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
