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
import { BlockchainProvider } from '@/components/providers/BlockchainProvider';
import AppShell from "@/components/ui/appShell";
import { usePathname } from "next/navigation";

const geist = Geist({
  subsets: ["latin"],
});

const glassTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: 'rgba(245, 247, 250, 0.85)',
      paper: 'rgba(255,255,255,0.18)',
    },
    primary: { main: '#3B82F6' },
    secondary: { main: '#EC4899' },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          border: '1px solid rgba(255,255,255,0.24)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.12)',
          boxShadow: '0 10px 30px 0 rgba(31, 38, 135, 0.18)',
          borderRadius: 18,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.22)',
          border: '1px solid rgba(255,255,255,0.32)',
          boxShadow: '0 2px 8px rgba(31,38,135,0.10)',
          borderRadius: 12,
          backdropFilter: 'blur(8px)',
          transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
          '&:hover': {
            background: 'rgba(255,255,255,0.32)',
            boxShadow: '0 6px 18px rgba(31,38,135,0.18)',
            transform: 'translateY(-2px) scale(1.04)',
          },
        },
      },
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const pathname = usePathname();

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
                borderRadius: '12px',
                padding: '12px 24px',
                fontWeight: 500,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: mode === 'light' 
                  ? '0 4px 14px rgba(59, 130, 246, 0.2)' 
                  : '0 4px 14px rgba(59, 130, 246, 0.4)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: mode === 'light'
                    ? '0 8px 20px rgba(59, 130, 246, 0.3)'
                    : '0 8px 20px rgba(59, 130, 246, 0.5)',
                },
              },
              contained: {
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                },
              },
              outlined: {
                borderWidth: '2px',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: '20px',
                background: mode === 'light'
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: mode === 'light' 
                  ? '0 20px 40px rgba(0, 0, 0, 0.1)'
                  : '0 20px 40px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: mode === 'light'
                    ? '0 30px 60px rgba(0, 0, 0, 0.12)'
                    : '0 30px 60px rgba(0, 0, 0, 0.4)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: '20px',
                backgroundImage: mode === 'light'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)'
                  : 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(30,41,59,0.7) 100%)',
                backdropFilter: 'blur(12px)',
              },
              elevation1: {
                boxShadow: mode === 'light'
                  ? '0 4px 20px rgba(0,0,0,0.05), 0 2px 10px rgba(0,0,0,0.03)'
                  : '0 4px 20px rgba(0,0,0,0.2), 0 2px 10px rgba(0,0,0,0.15)',
              },
              elevation2: {
                boxShadow: mode === 'light'
                  ? '0 8px 25px rgba(0,0,0,0.08), 0 3px 15px rgba(0,0,0,0.05)'
                  : '0 8px 25px rgba(0,0,0,0.25), 0 3px 15px rgba(0,0,0,0.15)',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: '8px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  '&.Mui-focused': {
                    boxShadow: mode === 'light'
                      ? '0 0 0 3px rgba(59, 130, 246, 0.15)'
                      : '0 0 0 3px rgba(59, 130, 246, 0.3)',
                  },
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: mode === 'light' 
                    ? 'rgba(59, 130, 246, 0.1)'
                    : 'rgba(59, 130, 246, 0.2)',
                  transform: 'translateY(-2px)',
                },
              },
            },
          },
          MuiFab: {
            styleOverrides: {
              root: {
                boxShadow: '0 6px 15px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.5)',
                  transform: 'translateY(-4px)',
                },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light'
                  ? '0 4px 20px rgba(0,0,0,0.05)'
                  : '0 4px 20px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(10px)',
                background: mode === 'light'
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(15,23,42,0.9)',
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                borderColor: mode === 'light'
                  ? 'rgba(0,0,0,0.08)'
                  : 'rgba(255,255,255,0.08)',
              },
            },
          },
        },
      }),
    [mode],
  );

  // List of public routes (same as in AppShell)
  const PUBLIC_ROUTES = [
    "/", "/blog", /^\/blog\/[^\/]+$/, "/reset", "/verify", "/login", "/signup"
  ];
  function isPublicRoute(path: string) {
    return PUBLIC_ROUTES.some(route =>
      typeof route === "string" ? route === path : route instanceof RegExp && route.test(path)
    );
  }

  return (
    <html lang="en">
      <body className={geist.className}>
        <AccessTokenWrapper getNodeUrl={getNodeUrl}>
          <ThemeProvider theme={glassTheme}>
            <CssBaseline />
            <Header toggleTheme={toggleTheme} isDarkMode={mode === 'dark'} />
            <BlockchainProvider>
              <Box
                component="main"
                className="animated-content"
                sx={{
                  minHeight: '100vh',
                  pt: '64px',
                  backgroundColor: 'background.default',
                  backgroundImage: mode === 'light'
                    ? 'radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.03) 0%, transparent 40%), radial-gradient(circle at 15% 85%, rgba(59, 130, 246, 0.03) 0%, transparent 40%)'
                    : 'radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.05) 0%, transparent 40%), radial-gradient(circle at 15% 85%, rgba(59, 130, 246, 0.05) 0%, transparent 40%)',
                }}
              >
                {isPublicRoute(pathname)
                  ? children
                  : <AppShell>{children}</AppShell>
                }
              </Box>
            </BlockchainProvider>
          </ThemeProvider>
        </AccessTokenWrapper>
      </body>
    </html>
  );
}
