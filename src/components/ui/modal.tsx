import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative bg-white dark:bg-dark-900 rounded-2xl shadow-2xl border border-light-200 dark:border-dark-800 max-w-md w-full mx-4 max-h-[90vh] overflow-auto ${className}`}>
        <div className="flex items-center justify-between p-6 border-b border-light-200 dark:border-dark-800">
          <h2 className="text-xl font-bold text-light-900 dark:text-dark-50">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-light-500 dark:text-dark-500 hover:text-light-700 dark:hover:text-dark-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}