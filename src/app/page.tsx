"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/appwrite';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.replace('/notes');
        } else {
          router.replace('/signup');
        }
      } catch (error) {
        router.replace('/signup');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2
      }}
    >
      <CircularProgress />
      <Typography variant="body1" color="text.secondary">
        Redirecting...
      </Typography>
    </Box>
  );
}