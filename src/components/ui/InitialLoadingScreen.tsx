'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InitialLoadingScreenProps {
  show?: boolean;
}

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ 
  show = true 
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ 
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-12 shadow-2xl border border-gray-200/20 dark:border-gray-700/20 backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95 max-w-md w-full mx-4"
          >
            <div className="flex flex-col items-center space-y-6">
              {/* Logo */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <img 
                  src="/logo/whisperrnote.png" 
                  alt="WhisperNote Logo" 
                  className="w-16 h-16 rounded-full" 
                />
              </div>
              
              {/* App Title */}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent text-center">
                WhisperNote
              </h1>
              
              {/* Loading text */}
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium text-center">
                Loading your creative space...
              </p>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: ["0%", "100%", "0%"] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              
              {/* Footer text */}
              <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
                © 2024 WhisperNote. All Rights Reserved.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};