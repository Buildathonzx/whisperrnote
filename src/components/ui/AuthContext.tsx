'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { InitialLoadingScreen } from './InitialLoadingScreen';

interface User {
  $id: string;
  email: string | null;
  name: string | null;
  emailVerification?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInitialLoading, setShowInitialLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to get current user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      // Show loading for minimum 1.5 seconds for better UX
      setTimeout(() => {
        setShowInitialLoading(false);
      }, 1500);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  // Show initial loading screen during auth check
  if (showInitialLoading) {
    return <InitialLoadingScreen show={true} />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};