'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  message?: string;
  show?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = "Loading...", 
  show = true 
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-40 pointer-events-none"
          style={{ 
            backdropFilter: 'blur(2px)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Subtle loading indicator in top-right */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-20 right-6 bg-white/90 dark:bg-gray-900/90 rounded-full p-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2">
              {/* Small spinner */}
              <div className="relative">
                <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                <div className="absolute top-0 left-0 w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
              
              {/* Optional text for important loads */}
              {message && message !== "Loading..." && (
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium max-w-24 truncate">
                  {message}
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;