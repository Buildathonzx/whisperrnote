import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Header from '../components/Header';
import { useState, useMemo } from 'react';
import "../globals.css";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WhisperNote",
  description: "A modern note-taking app",
};

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
            main: '#2196f3',
          },
          secondary: {
            main: '#f50057',
          },
        },
        typography: {
          fontFamily: geist.style.fontFamily,
        },
      }),
    [mode],
  );

  return (
    <html lang="en">
      <body className={geist.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Header toggleTheme={toggleTheme} isDarkMode={mode === 'dark'} />
          <Box
            component="main"
            sx={{
              minHeight: '100vh',
              pt: '64px', // Height of AppBar
            }}
          >
            {children}
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
