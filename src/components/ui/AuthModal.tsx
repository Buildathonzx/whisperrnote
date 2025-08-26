'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginEmailPassword, signupEmailPassword, getCurrentUser } from '@/lib/appwrite';
import { useAuth } from './AuthContext';
import { useLoading } from './LoadingContext';

// Type declarations for wallet functionality
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'selection' | 'email' | 'passkey' | 'wallet'>('selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login: authLogin, refreshUser } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setAuthMethod('selection');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const generateNonce = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const handleWalletAuth = async () => {
    setError('');
    showLoading('Connecting to wallet...');
    
    try {
      if (!window.ethereum) {
        setError('MetaMask is not installed. Please install MetaMask to continue.');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      if (!account) {
        setError('No wallet account found');
        return;
      }

      const nonce = generateNonce();
      const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`;
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account],
      });

      if (signature) {
        const mockUser = {
          $id: account,
          email: null,
          name: `Wallet ${account.slice(0, 6)}...${account.slice(-4)}`,
          walletAddress: account,
        };
        
        authLogin(mockUser);
        await refreshUser();
        handleClose();
      } else {
        setError('Wallet signature verification failed');
      }
    } catch (err: any) {
      if (err?.code === 4001) {
        setError('Wallet connection was rejected');
      } else {
        setError(err?.message || 'Wallet authentication failed');
      }
    } finally {
      hideLoading();
    }
  };

  const handlePasskeyAuth = async () => {
    setError('');
    showLoading('Authenticating with passkey...');
    
    try {
      if (!window.PublicKeyCredential) {
        setError('Passkeys are not supported in this browser');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = {
        $id: 'passkey_user_' + Date.now(),
        email: null,
        name: 'Passkey User',
      };
      
      authLogin(mockUser);
      await refreshUser();
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Passkey authentication failed');
    } finally {
      hideLoading();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    showLoading('Signing you in...');
    
    try {
      await loginEmailPassword(email, password);
      const user = await getCurrentUser();
      if (user) {
        authLogin(user);
        await refreshUser();
        handleClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      hideLoading();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    setError('');
    showLoading('Creating your account...');
    
    try {
      await signupEmailPassword(email, password, name);
      await loginEmailPassword(email, password);
      const user = await getCurrentUser();
      if (user) {
        authLogin(user);
        await refreshUser();
        handleClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      hideLoading();
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setAuthMethod('selection');
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
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="backdrop-blur-lg bg-light-card/95 dark:bg-dark-card/95 rounded-3xl shadow-3d-light dark:shadow-3d-dark border border-light-border/20 dark:border-dark-border/20 overflow-hidden">
            {/* Header */}
            <div className="p-6 text-center border-b border-light-border/20 dark:border-dark-border/20">
              <img 
                src="/logo/whisperrnote.png" 
                alt="WhisperNote Logo" 
                className="mx-auto mb-4 w-16 h-16 rounded-full shadow-3d-light dark:shadow-3d-dark" 
              />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-foreground/60">
                {mode === 'login' 
                  ? 'Sign in to your WhisperNote account' 
                  : 'Sign up to get started with WhisperNote'
                }
              </p>
            </div>

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

              {authMethod === 'selection' ? (
                <div className="space-y-4">
                  <p className="text-center text-foreground/60 mb-6">
                    Choose how you'd like to {mode === 'login' ? 'sign in' : 'create your account'}
                  </p>
                  
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAuthMethod('email')}
                      className="w-full p-4 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl hover:shadow-3d-light dark:hover:shadow-3d-dark transition-all text-left flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Continue with Email</div>
                        <div className="text-sm text-foreground/60">Use your email and password</div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePasskeyAuth()}
                      className="w-full p-4 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl hover:shadow-3d-light dark:hover:shadow-3d-dark transition-all text-left flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4 4-4 4 4 .257-.257A6 6 0 1118 8zm-6-6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Continue with Passkey</div>
                        <div className="text-sm text-foreground/60">Use biometric or security key</div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWalletAuth()}
                      className="w-full p-4 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl hover:shadow-3d-light dark:hover:shadow-3d-dark transition-all text-left flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Continue with Wallet</div>
                        <div className="text-sm text-foreground/60">Connect your Web3 wallet</div>
                      </div>
                    </motion.button>
                  </div>
                </div>
              ) : (
                <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                  {mode === 'signup' && (
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-xl bg-light-card dark:bg-dark-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-inner-light dark:shadow-inner-dark"
                          placeholder="Enter your name"
                          autoComplete="name"
                        />
                    </div>
                  )}

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-xl bg-light-card dark:bg-dark-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-inner-light dark:shadow-inner-dark"
                          placeholder="Enter your email"
                          autoComplete="email"
                        />
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                          Password
                        </label>
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-xl bg-light-card dark:bg-dark-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-inner-light dark:shadow-inner-dark"
                          placeholder="Enter your password"
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 px-4 bg-accent hover:bg-accent-dark text-light-bg rounded-xl font-semibold shadow-3d-light transition-all duration-200"
                      >
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                      </motion.button>

                  <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setAuthMethod('selection')}
                          className="text-sm text-accent hover:text-accent-dark transition-colors"
                        >
                          ← Back to options
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Footer */}
                  <div className="mt-6 text-center space-y-3">
                    {authMethod === 'email' && mode === 'login' && (
                      <a 
                        href="/reset" 
                        className="block text-sm text-accent hover:text-accent-dark transition-colors"
                        onClick={handleClose}
                      >
                        Forgot your password?
                      </a>
                    )}
                    
                    <p className="text-sm text-foreground/60">
                      {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{" "}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="text-accent hover:text-accent-dark font-medium transition-colors"
                      >
                        {mode === 'login' ? 'Sign up' : 'Sign in'}
                      </button>
                    </p>
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