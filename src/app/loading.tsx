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
  backgroundColor: '#F0F2F5', // Default light theme
  zIndex: 10000,
  padding: '16px',
  animation: `${fadeIn} 0.3s ease-out`,
}));

const LoadingCard = styled(Box)(() => ({
  width: '100%',
  maxWidth: '400px',
  padding: '48px 32px',
  backgroundColor: '#FFFFFF',
  borderRadius: '24px',
  border: '2px solid #E1E5E9',
  boxShadow: `0 20px 25px -5px rgba(45, 32, 22, 0.25), 
             0 8px 10px -6px rgba(45, 32, 22, 0.15),
             inset 0 -1px 2px 0 rgba(0, 0, 0, 0.05),
             inset 0 2px 4px 0 rgba(255, 255, 255, 0.8)`,
  transform: 'perspective(500px) rotateX(10deg) rotateY(-5deg)',
  transformStyle: 'preserve-3d',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeIn} 0.5s ease-out`,
}));

const ProgressBarContainer = styled(Box)(() => ({
  width: '100%',
  height: '12px',
  backgroundColor: '#F0F2F5',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #E1E5E9',
  boxShadow: 'inset 0 2px 4px rgba(45, 32, 22, 0.15), inset 0 1px 2px rgba(45, 32, 22, 0.1)',
  position: 'relative',
  perspective: '500px',
}));

const ProgressBar = styled(Box)(() => ({
  height: '100%',
  background: 'linear-gradient(135deg, #FFC107 0%, #FF8F00 50%, #FFC107 100%)',
  borderRadius: '8px',
  animation: `${progressAnimation} 2s ease-in-out infinite`,
  boxShadow: '0 0 12px rgba(255, 193, 7, 0.3), 0 2px 4px rgba(255, 193, 7, 0.15)',
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

const AppTitle = styled(Typography)(() => ({
  fontFamily: "'Inter', 'Noto Sans', sans-serif",
  fontWeight: 900,
  fontSize: '3rem',
  background: 'linear-gradient(135deg, #2D2016 0%, #5D4037 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textAlign: 'center',
  marginBottom: '24px',
  letterSpacing: '-0.02em',
  textShadow: '0 2px 4px rgba(45, 32, 22, 0.1)',
  transform: 'perspective(500px) rotateX(10deg)',
  transformOrigin: 'center bottom',
}));

const LoadingText = styled(Typography)(() => ({
  color: '#5D4037',
  textAlign: 'center',
  fontSize: '1.125rem',
  fontWeight: 500,
  marginBottom: '24px',
  letterSpacing: '0.01em',
}));

const Footer = styled(Box)(() => ({
  position: 'absolute',
  bottom: '16px',
  width: '100%',
  textAlign: 'center',
  color: '#8D6E63',
  fontSize: '0.75rem',
}));

export default function Loading() {
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
}