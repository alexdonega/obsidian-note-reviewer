import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { auth } from '../lib/auth';
import { log } from '../lib/logger';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    auth.getUser()
      .then(setUser)
      .catch((error) => {
        log.error('Failed to get initial user', error);
        setUser(null);
      })
      .finally(() => setLoading(false));

    // Listen to auth changes
    const { data: { subscription } } = auth.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,

    signIn: async (email, password) => {
      setLoading(true);
      try {
        await auth.signIn(email, password);
      } finally {
        setLoading(false);
      }
    },

    signUp: async (email, password, name) => {
      setLoading(true);
      try {
        await auth.signUp(email, password, name ? { name } : undefined);
      } finally {
        setLoading(false);
      }
    },

    signOut: async () => {
      setLoading(true);
      try {
        await auth.signOut();
        setUser(null);
      } finally {
        setLoading(false);
      }
    },

    signInWithOAuth: async (provider) => {
      setLoading(true);
      try {
        await auth.signInWithOAuth(provider);
      } finally {
        setLoading(false);
      }
    },

    resetPassword: async (email) => {
      await auth.resetPassword(email);
    },

    updatePassword: async (newPassword) => {
      await auth.updatePassword(newPassword);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
