import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]       = useState(() => localStorage.getItem('adminToken'));
  const [admin, setAdmin]       = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminUser') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading]   = useState(false);

  // Keep axios instance in sync — the interceptor already reads localStorage,
  // but we also store token in React state for UI gating.

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/admin/login', { email, password });
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
      setToken(data.token);
      setAdmin(data.admin);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setAdmin(null);
  }, []);

  const value = {
    token,
    admin,
    loading,
    isAuthenticated: !!token,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
