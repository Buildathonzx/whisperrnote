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
      // Check if MetaMask is installed
      if (!window.ethereum) {
        setError('MetaMask is not installed. Please install MetaMask to continue.');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      if (!account) {
        setError('No wallet account found');
        return;
      }

      const nonce = generateNonce();
      const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`;
      
      // Request signature from user
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account],
      });

      if (signature) {
        // For demo purposes, we'll assume wallet auth is successful
        // In a real app, you'd verify the signature on the server
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
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        setError('Passkeys are not supported in this browser');
        return;
      }

      // For demo purposes, we'll simulate passkey auth
      // In a real app, you'd use proper WebAuthn with server challenges
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate auth delay
      
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

  const renderAuthMethodSelection = () => (
    <div className="space-y-4">
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        Choose how you'd like to {mode === 'login' ? 'sign in' : 'create your account'}
      </p>
      
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAuthMethod('email')}
          className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left flex items-center space-x-3"
        >
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Continue with Email</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Use your email and password</div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handlePasskeyAuth()}
          className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left flex items-center space-x-3"
        >
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4 4-4 4 4 .257-.257A6 6 0 1118 8zm-6-6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Continue with Passkey</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Use biometric or security key</div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleWalletAuth()}
          className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left flex items-center space-x-3"
        >
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Continue with Wallet</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Connect your Web3 wallet</div>
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderEmailForm = () => (
    <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
      {mode === 'signup' && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
            placeholder="Enter your name"
            autoComplete="name"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
          placeholder="Enter your email"
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
          placeholder="Enter your password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold shadow-lg transition-all duration-200"
      >
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </motion.button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setAuthMethod('selection')}
          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
        >
          ← Back to options
        </button>
      </div>
    </form>
  );

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
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
            {/* Header */}
            <div className="p-6 text-center border-b border-gray-200/20 dark:border-gray-700/20">
              <img 
                src="/logo/whisperrnote.png" 
                alt="WhisperNote Logo" 
                className="mx-auto mb-4 w-16 h-16 rounded-full shadow-md" 
              />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
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
                  className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4"
                >
                  {error}
                </motion.div>
              )}

              {authMethod === 'selection' ? renderAuthMethodSelection() : renderEmailForm()}

              {/* Footer */}
              <div className="mt-6 text-center space-y-3">
                {authMethod === 'email' && mode === 'login' && (
                  <a 
                    href="/reset" 
                    className="block text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                    onClick={handleClose}
                  >
                    Forgot your password?
                  </a>
                )}
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
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