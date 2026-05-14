'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { User, AuthTokens } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  hasRole: (role: string) => boolean;
  viewMode: 'ADMIN' | 'USER';
  toggleViewMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'ADMIN' | 'USER'>('USER');

  useEffect(() => {
    const savedMode = localStorage.getItem('viewMode') as 'ADMIN' | 'USER';
    if (savedMode) {
      setViewMode(savedMode);
    }
  }, []);

  const toggleViewMode = () => {
    const newMode = viewMode === 'ADMIN' ? 'USER' : 'ADMIN';
    setViewMode(newMode);
    localStorage.setItem('viewMode', newMode);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.data.user);
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });

    if (data.success) {
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      setUser(data.data.user);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { username, email, password });

    if (data.success) {
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      setUser(data.data.user);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isInstructor: user?.role === 'INSTRUCTOR',
    isStudent: user?.role === 'STUDENT',
    hasRole: (role: string) => user?.role === role,
    viewMode: user?.role === 'ADMIN' ? viewMode : 'USER',
    toggleViewMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
