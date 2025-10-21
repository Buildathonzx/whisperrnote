'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginEmailPassword, signupEmailPassword, getCurrentUser, account, functions } from '@/lib/appwrite';
import { OAuthProvider } from 'appwrite';
import {
  registerPasskey,
  authenticateWithPasskey,
  isPlatformAuthenticatorAvailable
} from '@/lib/appwrite/auth/passkey';
import { PasswordInputWithStrength } from './PasswordStrengthIndicator';
import { useAuth } from './AuthContext';
import { useLoading } from './LoadingContext';

// Type declarations for wallet functionality
declare global {
  interface Window {
    PublicKeyCredential?: any;
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
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
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [walletMessage, setWalletMessage] = useState('Checking wallet availability...');
  const [walletAvailable, setWalletAvailable] = useState(false);
  const { login: authLogin, refreshUser } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  // Check for passkey and wallet support on mount
  useEffect(() => {
    const checkSupport = async () => {
      setPasskeySupported(await isPlatformAuthenticatorAvailable());
      const hasEth = typeof window !== 'undefined' && !!window.ethereum;
      setWalletAvailable(hasEth);
      setWalletMessage(
        hasEth
          ? 'Wallet detected and ready to connect'
          : 'Install MetaMask or another wallet extension'
      );
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
    if (!email || !isValidEmail(email)) {
      setTooltip('Enter your email first to register or authenticate with wallet');
      setError('');
      return;
    }

    try {
      setError('');
      setTooltip('');
      showLoading('Connecting to wallet...');

      if (!window.ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask.');
      }

      // Connect wallet
      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const address = accounts?.[0];
      if (!address) throw new Error('No wallet address available');

      // Generate message and sign
      const timestamp = Date.now();
      const message = `auth-${timestamp}`;
      const fullMessage = `Sign this message to authenticate: ${message}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [fullMessage, address]
      });

      // Call Appwrite Function
      const fnId = (process.env.NEXT_PUBLIC_FUNCTION_ID 
        || process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID_WALLET 
        || process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID) as string | undefined;
      if (!fnId) throw new Error('Wallet auth function not configured');

      const execution = await functions.createExecution(
        fnId,
        JSON.stringify({ email, address, signature, message }),
        false
      );

      const response = JSON.parse((execution as any).responseBody || '{}');
      const status = (execution as any).responseStatusCode;
      if (status !== 200) {
        throw new Error(response?.error || 'Authentication failed');
      }

      // Create session
      await account.createSession({ userId: response.userId, secret: response.secret });

      // Sync app auth state
      const user = await getCurrentUser();
      if (user) {
        authLogin(user);
        await refreshUser();
        handleClose();
      }
    } catch (err: any) {
      console.error('Wallet authentication error:', err);
      setError(err?.message || 'Wallet authentication failed');
    } finally {
      hideLoading();
    }
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    try {
      setError('');
      setTooltip('');
      showLoading(`Redirecting to ${provider}...`);

      const success = `${typeof window !== 'undefined' ? window.location.origin : ''}/`;
      const failure = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth-error`;
      
      await account.createOAuth2Session({ provider, success, failure });
    } catch (err: any) {
      console.error('OAuth authentication error:', err);
      setError(err?.message || `${provider} authentication failed`);
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

      if (authResult.error === 'NO_CREDENTIAL') {
        // No credential registered yet -> seamlessly switch to registration path
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
      } else if (authResult.error) {
        setError(authResult.error === 'No passkey credentials found' ? 'No passkey registered for this account.' : authResult.error);
      } else {
        setError('Passkey authentication failed');
      }
      
    } catch (err: any) {
      console.error('Passkey authentication error:', err);
      setError(err.message || 'Passkey authentication failed');
    } finally {
      hideLoading();
    }
  };

  const handleInternetIdentity = () => {
    // Open Internet Identity in a new, smaller window
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      'https://identity.internetcomputer.org/',
      'internet-identity',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !isValidEmail(email)) return;

    // Validate password strength for signup attempts
    if (passwordStrength && !passwordStrength.isValid) {
      setError('Please choose a stronger password that meets the requirements.');
      return;
    }

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
      } catch {
        // If login fails, try to signup (only if password is strong enough)
        if (passwordStrength && passwordStrength.isValid) {
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
        } else {
          // For weak passwords, show login error instead of attempting signup
          throw new Error('Invalid email or password. Please check your credentials.');
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
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <PasswordInputWithStrength
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onStrengthChange={setPasswordStrength}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          autoFocus
                        />
                      </motion.div>
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

                 {/* Passkey, Wallet & OAuth - Dynamic Grid Layout */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {/* Passkey Button */}
                  <motion.button
                    whileHover={{ scale: passkeySupported ? 1.02 : 1 }}
                    whileTap={{ scale: passkeySupported ? 0.98 : 1 }}
                    onClick={handlePasskeyAuth}
                    disabled={!passkeySupported}
                    title={passkeySupported ? 'Passkey' : 'Passkey (Not Available)'}
                    className={`p-3 border rounded-xl transition-all text-center flex flex-col items-center justify-center ${
                      passkeySupported 
                        ? 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border hover:shadow-3d-light dark:hover:shadow-3d-dark cursor-pointer' 
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1.5 ${
                      passkeySupported ? 'bg-accent/10' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <svg className={`w-3.5 h-3.5 ${passkeySupported ? 'text-accent' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4 4-4 4 4 .257-.257A6 6 0 1118 8zm-6-6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className={`font-medium text-xs ${passkeySupported ? 'text-foreground' : 'text-gray-500'}`}>
                      Passkey
                    </div>
                  </motion.button>

                  {/* Wallet Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWalletAuth}
                    title="Wallet"
                    className="p-3 border rounded-xl transition-all text-center bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border hover:shadow-3d-light dark:hover:shadow-3d-dark cursor-pointer flex flex-col items-center justify-center"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mb-1.5 bg-accent/10">
                      <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="font-medium text-xs text-foreground">
                      Wallet
                    </div>
                  </motion.button>

                  {/* Google OAuth Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOAuthLogin(OAuthProvider.Google)}
                    title="Google"
                    className="p-3 border rounded-xl transition-all text-center bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border hover:shadow-3d-light dark:hover:shadow-3d-dark cursor-pointer flex flex-col items-center justify-center"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mb-1.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div className="font-medium text-xs text-foreground">
                      Google
                    </div>
                  </motion.button>

                  {/* GitHub OAuth Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOAuthLogin(OAuthProvider.Github)}
                    title="GitHub"
                    className="p-3 border rounded-xl transition-all text-center bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border hover:shadow-3d-light dark:hover:shadow-3d-dark cursor-pointer flex flex-col items-center justify-center"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mb-1.5">
                      <svg className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="font-medium text-xs text-foreground">
                      GitHub
                    </div>
                  </motion.button>

                  {/* Internet Identity Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInternetIdentity}
                    title="Internet Identity"
                    className="p-3 border border-light-border dark:border-dark-border rounded-xl bg-light-card dark:bg-dark-card hover:shadow-3d-light dark:hover:shadow-3d-dark transition-all text-center cursor-pointer flex flex-col items-center justify-center"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center mb-1.5">
                      <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zM9 9V6h2v3h3v2h-3v3H9v-3H6V9h3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="font-medium text-xs text-foreground">
                      ICP
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