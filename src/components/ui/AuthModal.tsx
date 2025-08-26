'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginEmailPassword, signupEmailPassword, getCurrentUser } from '@/lib/appwrite';
import { 
  registerPasskey, 
  authenticateWithPasskey, 
  isPlatformAuthenticatorAvailable 
} from '@/lib/appwrite/auth/passkey';
import { 
  registerWallet, 
  authenticateWithWallet, 
  isWalletAvailable,
  getWalletStatus 
} from '@/lib/appwrite/auth/wallet';
import { useAuth } from './AuthContext';
import { useLoading } from './LoadingContext';

// Type declarations for wallet functionality
declare global {
  interface Window {
    ethereum?: any;
    PublicKeyCredential?: any;
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tooltip, setTooltip] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [walletAvailable, setWalletAvailable] = useState(false);
  const { login: authLogin, refreshUser } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  // Check for passkey and wallet support on mount
  useEffect(() => {
    const checkSupport = async () => {
      setPasskeySupported(await isPlatformAuthenticatorAvailable());
      setWalletAvailable(isWalletAvailable());
    };
    checkSupport();
  }, []);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Show password field after user stops typing email for 600ms AND email is valid, OR if force revealed
  useEffect(() => {
    if (email.trim().length === 0) {
      setShowPasswordField(false);
      return;
    }

    if (!isValidEmail(email)) {
      setShowPasswordField(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowPasswordField(true);
    }, 600); // Reduced from 1000ms to 600ms for snappier response

    return () => clearTimeout(timer);
  }, [email]);

  // Handle Enter key in email field to force reveal password
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (email.trim().length > 0) {
        setShowPasswordField(true);
      }
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setTooltip('');
    setShowPasswordField(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Generate username from email
  const generateUsername = (email: string): string => {
    const localPart = email.split('@')[0];
    // Remove numbers and non-alphanumeric characters, keep only letters
    const sanitized = localPart.replace(/[0-9]/g, '').replace(/[^a-zA-Z]/g, '');
    // Ensure minimum length and fallback
    return sanitized.length >= 3 ? sanitized.toLowerCase() : 'user' + Math.random().toString(36).substring(2, 8);
  };

  const handleWalletAuth = async () => {
    if (!walletAvailable) {
      setError('No wallet detected. Please install MetaMask or another Web3 wallet.');
      return;
    }

    setError('');
    setTooltip('');
    showLoading('Connecting to wallet...');
    
    try {
      // Check if wallet is already connected and registered
      const walletStatus = await getWalletStatus();
      
      if (walletStatus.connected) {
        // Try to authenticate with existing wallet
        const authResult = await authenticateWithWallet();
        
        if (authResult.success) {
          const user = await getCurrentUser();
          if (user) {
            authLogin(user);
            await refreshUser();
            handleClose();
            return;
          }
        }
      }
      
      // If not authenticated, register new wallet
      showLoading('Registering wallet...');
      const connection = await registerWallet();
      
      if (connection) {
        const user = await getCurrentUser();
        if (user) {
          authLogin(user);
          await refreshUser();
          handleClose();
        }
      }
      
    } catch (err: any) {
      console.error('Wallet authentication error:', err);
      setError(err.message || 'Wallet authentication failed');
    } finally {
      hideLoading();
    }
  };

  const handlePasskeyAuth = async () => {
    if (!passkeySupported) {
      setError('Passkeys are not supported on this device or browser.');
      return;
    }

    if (!email || !email.includes('@')) {
      setTooltip('Enter your email first to register or authenticate with passkey');
      setError('');
      return;
    }
    
    setError('');
    setTooltip('');
    showLoading('Setting up passkey authentication...');
    
    try {
      // Try to authenticate with existing passkey
      const authResult = await authenticateWithPasskey(email);
      
      if (authResult.success) {
        const user = await getCurrentUser();
        if (user) {
          authLogin(user);
          await refreshUser();
          handleClose();
          return;
        }
      }
      
      // If authentication failed, try to register new passkey
      showLoading('Registering new passkey...');
      const credential = await registerPasskey({
        email,
        displayName: email.split('@')[0]
      });
      
      if (credential) {
        const user = await getCurrentUser();
        if (user) {
          authLogin(user);
          await refreshUser();
          handleClose();
        }
      }
      
    } catch (err: any) {
      console.error('Passkey authentication error:', err);
      setError(err.message || 'Passkey authentication failed');
    } finally {
      hideLoading();
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !isValidEmail(email)) return;

    setError('');
    showLoading('Authenticating...');
    
    try {
      // First try to login
      try {
        await loginEmailPassword(email, password);
        const user = await getCurrentUser();
        if (user) {
          authLogin(user);
          await refreshUser();
          handleClose();
          return;
        }
      } catch (loginError: any) {
        // If login fails, try to signup
        const username = generateUsername(email);
        await signupEmailPassword(email, password, username);
        await loginEmailPassword(email, password);
        const user = await getCurrentUser();
        if (user) {
          authLogin(user);
          await refreshUser();
          handleClose();
          return;
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      hideLoading();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="backdrop-blur-lg bg-light-card/95 dark:bg-dark-card/95 rounded-3xl shadow-3d-light dark:shadow-3d-dark border border-light-border/20 dark:border-dark-border/20 overflow-hidden">
            {/* Content */}
            <div className="p-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100/80 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-4 shadow-inner-light dark:shadow-inner-dark"
                >
                  {error}
                </motion.div>
              )}

              {tooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-100/80 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-xl mb-4 shadow-inner-light dark:shadow-inner-dark"
                >
                  {tooltip}
                </motion.div>
              )}

              {/* Continue with section */}
              <div className="space-y-6">
                <h3 className="text-center text-lg font-medium text-foreground mb-6">
                  Continue with:
                </h3>
                
                {/* Email Option */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <span className="font-medium text-foreground">Email</span>
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={handleEmailKeyDown}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-xl bg-light-card dark:bg-dark-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-inner-light dark:shadow-inner-dark"
                      autoComplete="email"
                    />
                    
                    {showPasswordField && (
                      <motion.input
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-xl bg-light-card dark:bg-dark-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-inner-light dark:shadow-inner-dark"
                        autoComplete="current-password"
                        autoFocus
                      />
                    )}
                    
                    {showPasswordField && (
                      <motion.button
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleAuth}
                        className="w-full bg-accent hover:bg-accent/90 text-white py-2 px-4 rounded-xl font-medium transition-colors shadow-3d-light dark:shadow-3d-dark"
                      >
                        Continue
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-light-border dark:bg-dark-border"></div>
                  <span className="text-sm text-foreground/60">or</span>
                  <div className="flex-1 h-px bg-light-border dark:bg-dark-border"></div>
                </div>

                 {/* Passkey & Wallet Buttons */}
                <div className="flex flex-col md:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: passkeySupported ? 1.02 : 1 }}
                    whileTap={{ scale: passkeySupported ? 0.98 : 1 }}
                    onClick={handlePasskeyAuth}
                    disabled={!passkeySupported}
                    className={`flex-1 p-4 border rounded-xl transition-all text-center ${
                      passkeySupported 
                        ? 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border hover:shadow-3d-light dark:hover:shadow-3d-dark cursor-pointer' 
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      passkeySupported ? 'bg-accent/10' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <svg className={`w-4 h-4 ${passkeySupported ? 'text-accent' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4 4-4 4 4 .257-.257A6 6 0 1118 8zm-6-6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className={`font-medium text-sm ${passkeySupported ? 'text-foreground' : 'text-gray-500'}`}>
                      Passkey {!passkeySupported && '(Not Available)'}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: walletAvailable ? 1.02 : 1 }}
                    whileTap={{ scale: walletAvailable ? 0.98 : 1 }}
                    onClick={handleWalletAuth}
                    disabled={!walletAvailable}
                    className={`flex-1 p-4 border rounded-xl transition-all text-center ${
                      walletAvailable 
                        ? 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border hover:shadow-3d-light dark:hover:shadow-3d-dark cursor-pointer' 
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      walletAvailable ? 'bg-accent/10' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <svg className={`w-4 h-4 ${walletAvailable ? 'text-accent' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className={`font-medium text-sm ${walletAvailable ? 'text-foreground' : 'text-gray-500'}`}>
                      Wallet {!walletAvailable && '(Not Available)'}
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-foreground/40 hover:text-foreground/60 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};