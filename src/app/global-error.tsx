'use client';

import { useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            backgroundColor: '#f5f5f5',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 500,
              width: '100%',
              borderRadius: 2,
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: '#d32f2f',
                mb: 2,
              }}
            />
            
            <Typography variant="h4" component="h1" gutterBottom>
              Application Error
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              A critical error occurred in the application. Please refresh the page or contact support.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && (
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  backgroundColor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                  mb: 3,
                  textAlign: 'left',
                  overflow: 'auto',
                  fontSize: '0.75rem',
                }}
              >
                {error.message}
              </Typography>
            )}
            
            <Button
              variant="contained"
              onClick={reset}
              startIcon={<RefreshIcon />}
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                },
              }}
            >
              Reload Application
            </Button>
          </Paper>
        </Box>
      </body>
    </html>
  );
}