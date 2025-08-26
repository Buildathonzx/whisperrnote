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
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={closeOverlay}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative z-50 w-full max-w-4xl my-8 mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Overlay;
