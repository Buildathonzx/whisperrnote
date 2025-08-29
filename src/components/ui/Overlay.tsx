"use client";

import React from 'react';
import { useOverlay } from './OverlayContext';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay: React.FC = () => {
  const { isOpen, content, closeOverlay } = useOverlay();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto"
          onClick={closeOverlay}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative z-50 w-full max-w-4xl mx-auto my-2 sm:my-8 max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto">
              {content}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Overlay;
