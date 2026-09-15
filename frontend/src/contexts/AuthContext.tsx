'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('accessToken');
    const expired = () => { setUser(null); queryClient.clear(); };
    window.addEventListener('auth:expired', expired);
    checkAuth();
    return () => window.removeEventListener('auth:expired', expired);
  }, []);

  const checkAuth = async () => {
    try {
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
      queryClient.clear();
      setUser(data.data.user);
      return data.data.user;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { username, email, password });

    if (data.success) {
      queryClient.clear();
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
      queryClient.clear();
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
