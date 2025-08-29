'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, logout as authLogout } from '@/lib/auth';
import { InitialLoadingScreen } from './InitialLoadingScreen';
import { EmailVerificationReminder } from './EmailVerificationReminder';
// Removed AuthErrorBoundary to avoid leaking auth errors into UI
// import { AuthErrorBoundary } from './ErrorBoundary';

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
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  recoverSession: () => Promise<boolean>;
  shouldShowEmailVerificationReminder: () => boolean;
  dismissEmailVerificationReminder: () => void;
  showAuthModal: () => void;
  hideAuthModal: () => void;
  hideAuthModalAndRedirect: () => void;
  authModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [emailVerificationReminderDismissed, setEmailVerificationReminderDismissed] = useState(false);

  const refreshUser = async (isRetry = false) => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      // Reset retry count on success
      if (isRetry) {
        console.log('Authentication state recovered successfully');
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
      setUser(null);

      // If this is the initial load and we failed, don't retry immediately
      // to avoid infinite loops, but log for debugging
      if (!isRetry && !isLoading) {
        console.warn('Initial authentication check failed, user may need to re-authenticate');
      }
    } finally {
      setIsLoading(false);
      // Reduced loading time to prevent excessive flashing
      setTimeout(() => {
        setShowInitialLoading(false);
      }, 800); // Reduced from 1500ms to 800ms
    }
  };

  // Periodic session validation to detect expired sessions
  useEffect(() => {
    // Restore email verification reminder dismissal state
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('emailVerificationReminderDismissed');
      if (dismissed === 'true') {
        setEmailVerificationReminderDismissed(true);
      }
    }

    refreshUser();

    // Set up periodic session validation (every 5 minutes)
    const sessionCheckInterval = setInterval(async () => {
      if (user && !isLoading) {
        try {
          const currentUser = await getCurrentUser();
          // If user exists but session is invalid, clear state
          if (!currentUser && user) {
            console.warn('Session expired, clearing authentication state');
            setUser(null);
            // Optionally show auth modal
            setAuthModalOpen(true);
          } else if (currentUser && currentUser.$id !== user.$id) {
            // User changed (edge case), update state
            setUser(currentUser);
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          // Don't clear user state on network errors, just log
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Listen for visibility change to re-validate session when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden && user && !isLoading) {
        refreshUser(true); // Pass true to indicate this is a retry
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for online/offline events
    const handleOnline = () => {
      if (user && !isLoading) {
        console.log('Network connection restored, validating session');
        refreshUser(true);
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(sessionCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [user, isLoading]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authLogout();
      // Additional cleanup for wallet connections
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        // Note: We don't disconnect wallet here as that would be disruptive to user
        // The wallet connection state is managed by the wallet provider
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear local user state regardless of logout success
      setUser(null);
      // Clear any temporary auth state
      setAuthModalOpen(false);
    }
  };

  // Session recovery function for when authentication state becomes inconsistent
  const recoverSession = async () => {
    console.log('Attempting session recovery...');
    setIsLoading(true);

    try {
      // Try to refresh the user data
      await refreshUser(true);

      if (user) {
        console.log('Session recovery successful');
        return true;
      } else {
        console.log('Session recovery failed, user needs to re-authenticate');
        setAuthModalOpen(true);
        return false;
      }
    } catch (error) {
      console.error('Session recovery failed:', error);
      setAuthModalOpen(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification reminder logic
  const shouldShowEmailVerificationReminder = (): boolean => {
    if (!user || user.emailVerification || emailVerificationReminderDismissed) {
      return false;
    }

    // Check if account is older than 24 hours
    const accountAge = Date.now() - new Date(user.$createdAt).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    return accountAge > oneDay;
  };

  const dismissEmailVerificationReminder = (): void => {
    setEmailVerificationReminderDismissed(true);
    // Store dismissal in localStorage to persist across sessions
    if (typeof window !== 'undefined') {
      localStorage.setItem('emailVerificationReminderDismissed', 'true');
    }
  };

  const showAuthModal = () => {
    setAuthModalOpen(true);
  };

  const hideAuthModal = () => {
    setAuthModalOpen(false);
  };

  const hideAuthModalAndRedirect = () => {
    setAuthModalOpen(false);
    // Small delay to ensure modal closes before navigation
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    recoverSession,
    shouldShowEmailVerificationReminder,
    dismissEmailVerificationReminder,
    showAuthModal,
    hideAuthModal,
    hideAuthModalAndRedirect,
    authModalOpen,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showInitialLoading && <InitialLoadingScreen show={true} />}
      <EmailVerificationReminder />
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