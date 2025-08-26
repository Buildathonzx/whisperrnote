'use client';

import React from 'react';
import { useAuth } from './AuthContext';
import { AuthModal } from './AuthModal';

export const AuthModalContainer: React.FC = () => {
  const { authModalOpen, hideAuthModal } = useAuth();

  return (
    <AuthModal
      isOpen={authModalOpen}
      onClose={hideAuthModal}
    />
  );
};