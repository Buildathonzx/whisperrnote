'use client';

import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const progressAnimation = keyframes`
  0% {
    width: 0%;
  }
  50% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
`;

const LoadingContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#1a1816' 
    : '#F0F2F5',
  zIndex: 10000,
  padding: theme.spacing(2),
  animation: `${fadeIn} 0.3s ease-out`,
}));

const LoadingCard = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '400px',
  padding: theme.spacing(6, 4),
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#26221f' 
    : '#FFFFFF',
  borderRadius: '24px',
  border: theme.palette.mode === 'dark' 
    ? '2px solid #404040' 
    : '2px solid #E1E5E9',
  boxShadow: theme.palette.mode === 'dark'
    ? `0 20px 25px -5px rgba(0, 0, 0, 0.6), 
       0 8px 10px -6px rgba(0, 0, 0, 0.4),
       inset 0 -1px 2px 0 rgba(255, 255, 255, 0.05),
       inset 0 2px 4px 0 rgba(255, 255, 255, 0.02)`
    : `0 20px 25px -5px rgba(45, 32, 22, 0.25), 
       0 8px 10px -6px rgba(45, 32, 22, 0.15),
       inset 0 -1px 2px 0 rgba(0, 0, 0, 0.05),
       inset 0 2px 4px 0 rgba(255, 255, 255, 0.8)`,
  transform: 'perspective(500px) rotateX(10deg) rotateY(-5deg)',
  transformStyle: 'preserve-3d',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeIn} 0.5s ease-out`,
  
  '&:hover': {
    transform: 'perspective(500px) rotateX(0deg) rotateY(0deg) scale(1.02)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 32px 40px -8px rgba(0, 0, 0, 0.7), 
         0 12px 16px -8px rgba(0, 0, 0, 0.5),
         inset 0 -1px 2px 0 rgba(255, 255, 255, 0.08),
         inset 0 2px 4px 0 rgba(255, 255, 255, 0.04)`
      : `0 32px 40px -8px rgba(45, 32, 22, 0.35), 
         0 12px 16px -8px rgba(45, 32, 22, 0.25),
         inset 0 -1px 2px 0 rgba(0, 0, 0, 0.08),
         inset 0 2px 4px 0 rgba(255, 255, 255, 0.9)`,
  },
}));

const ProgressBarContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '12px',
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#312b28' 
    : '#F0F2F5',
  borderRadius: '8px',
  overflow: 'hidden',
  border: theme.palette.mode === 'dark' 
    ? '1px solid #404040' 
    : '1px solid #E1E5E9',
  boxShadow: theme.palette.mode === 'dark'
    ? 'inset 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)'
    : 'inset 0 2px 4px rgba(45, 32, 22, 0.15), inset 0 1px 2px rgba(45, 32, 22, 0.1)',
  position: 'relative',
  perspective: '500px',
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  height: '100%',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%)'
    : 'linear-gradient(135deg, #FFC107 0%, #FF8F00 50%, #FFC107 100%)',
  borderRadius: '8px',
  animation: `${progressAnimation} 2s ease-in-out infinite`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 0 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(59, 130, 246, 0.2)'
    : '0 0 12px rgba(255, 193, 7, 0.3), 0 2px 4px rgba(255, 193, 7, 0.15)',
  position: 'relative',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
    borderRadius: '8px',
  },
}));

const AppTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "'Inter', 'Noto Sans', sans-serif",
  fontWeight: 900,
  fontSize: '3rem',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #FFFFFF 0%, #EFEBE9 100%)'
    : 'linear-gradient(135deg, #2D2016 0%, #5D4037 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  letterSpacing: '-0.02em',
  textShadow: theme.palette.mode === 'dark'
    ? '0 2px 4px rgba(0, 0, 0, 0.5)'
    : '0 2px 4px rgba(45, 32, 22, 0.1)',
  transform: 'perspective(500px) rotateX(10deg)',
  transformOrigin: 'center bottom',
  // Ensure the title is always visible and prominent
  opacity: 1,
  visibility: 'visible',
  position: 'relative',
  zIndex: 1,
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  color: theme.palette.mode === 'dark' 
    ? '#a1a1aa' 
    : '#5D4037',
  textAlign: 'center',
  fontSize: '1.125rem',
  fontWeight: 500,
  marginBottom: theme.spacing(3),
  letterSpacing: '0.01em',
}));

const Footer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  width: '100%',
  textAlign: 'center',
  color: theme.palette.mode === 'dark' 
    ? '#6b7280' 
    : '#8D6E63',
  fontSize: '0.75rem',
}));

interface InitialLoadingScreenProps {
  show?: boolean;
}

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ 
  show = true 
}) => {
  if (!show) return null;

  return (
    <LoadingContainer>
      <LoadingCard>
        <AppTitle variant="h1">
          WhisperNote
        </AppTitle>
        
        <LoadingText variant="body1">
          Loading your creative space...
        </LoadingText>
        
        <ProgressBarContainer>
          <ProgressBar />
        </ProgressBarContainer>
      </LoadingCard>
      
      <Footer>
        © 2024 WhisperNote. All Rights Reserved.
      </Footer>
    </LoadingContainer>
  );
};