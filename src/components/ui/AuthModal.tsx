'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginEmailPassword, signupEmailPassword, getCurrentUser } from '@/lib/appwrite';
import { useAuth } from './AuthContext';
import { useLoading } from './LoadingContext';

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
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
              </form>

              {/* Footer */}
              <div className="mt-6 text-center space-y-3">
                {mode === 'login' && (
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