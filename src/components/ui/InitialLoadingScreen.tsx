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
            className="bg-light-card dark:bg-dark-card rounded-3xl p-12 shadow-3d-light dark:shadow-3d-dark border border-light-border/20 dark:border-dark-border/20 backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95 max-w-md w-full mx-4"
          >
            <div className="flex flex-col items-center space-y-6">
              {/* Logo */}
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center shadow-3d-light dark:shadow-3d-dark">
                <img 
                  src="/logo/whisperrnote.png" 
                  alt="WhisperNote Logo" 
                  className="w-16 h-16 rounded-full" 
                />
              </div>
              
              {/* App Title */}
              <h1 className="text-4xl font-bold text-foreground text-center">
                WhisperNote
              </h1>
              
              {/* Loading text */}
              <p className="text-foreground/60 text-lg font-medium text-center">
                Loading your creative space...
              </p>
              
              {/* Progress bar */}
              <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-3 overflow-hidden shadow-inner-light dark:shadow-inner-dark">
                <motion.div
                  className="h-full bg-accent rounded-full"
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
              <p className="text-xs text-foreground/40 text-center mt-4">
                © 2025 WhisperNote. All Rights Reserved.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};