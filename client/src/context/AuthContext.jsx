import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the current user on mount
  const fetchMe = useCallback(async () => {
    try {
      const res = await authService.getMe();
      const userData = res.data?.data?.user || res.data?.data;
      setUser(userData || null);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { user: userData, token } = res.data?.data || {};
    if (token) {
      localStorage.setItem('token', token);
    }
    const currentUser = userData || res.data?.data;
    setUser(currentUser);
    return currentUser;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const { user: userData, token } = res.data?.data || {};
    if (token) {
      localStorage.setItem('token', token);
    }
    const currentUser = userData || res.data?.data;
    setUser(currentUser);
    return currentUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network errors during logout
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateUser = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updateProfile = async (profileData) => {
    const res = await authService.updateProfile(profileData);
    const updatedUser = res.data?.data?.user || res.data?.data;
    if (updatedUser) {
      setUser(updatedUser);
    }
    return updatedUser;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    fetchMe,
    isAuthenticated: !!user,
    role: user?.role,
    isDonor: user?.role === 'donor',
    isNgo: user?.role === 'ngo',
    isVolunteer: user?.role === 'volunteer',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
