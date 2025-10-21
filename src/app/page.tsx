"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ui/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect after auth check completes
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/notes');
      } else {
        router.replace('/landing');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while auth is being checked
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: 2,
        background: 'linear-gradient(135deg, var(--color-accent, #3b82f6) 0%, var(--color-accent-dark, #1e40af) 100%)',
      }}
    >
      <CircularProgress size={48} thickness={4} sx={{ color: 'white' }} />
      <Typography variant="body1" sx={{ color: 'white' }}>
        Loading...
      </Typography>
    </Box>
  );
}