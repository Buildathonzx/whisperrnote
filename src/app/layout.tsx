'use client';

import { Geist } from "next/font/google";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Header from '../components/Header';
import { useState, useMemo } from 'react';
import "../globals.css";
import { AccessTokenWrapper } from '@calimero-network/calimero-client';
import { getNodeUrl } from '@/lib/calimero/config';

const geist = Geist({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#3B82F6',
            light: '#60A5FA',
            dark: '#2563EB',
          },
          secondary: {
            main: '#EC4899',
            light: '#F472B6',
            dark: '#DB2777',
          },
          background: {
            default: mode === 'light' ? '#F8FAFC' : '#0F172A',
            paper: mode === 'light' ? '#FFFFFF' : '#1E293B',
          },
          text: {
            primary: mode === 'light' ? '#1E293B' : '#F8FAFC',
            secondary: mode === 'light' ? '#475569' : '#CBD5E1',
          },
        },
        typography: {
          fontFamily: geist.style.fontFamily,
          h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
          },
          h2: {
            fontSize: '2rem',
            fontWeight: 600,
          },
          h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
          },
          body1: {
            fontSize: '1rem',
            lineHeight: 1.7,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 500,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: '12px',
                boxShadow: mode === 'light' 
                  ? '0 1px 3px rgba(0,0,0,0.1)'
                  : '0 1px 3px rgba(0,0,0,0.3)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: '12px',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <html lang="en">
      <body className={geist.className}>
        <AccessTokenWrapper getNodeUrl={getNodeUrl}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header toggleTheme={toggleTheme} isDarkMode={mode === 'dark'} />
            <Box
              component="main"
              sx={{
                minHeight: '100vh',
                pt: '64px',
                backgroundColor: 'background.default',
              }}
            >
              {children}
            </Box>
          </ThemeProvider>
        </AccessTokenWrapper>
      </body>
    </html>
  );
}
