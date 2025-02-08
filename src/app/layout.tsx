import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Header from '../components/Header';  // Changed from @/components/Header
import "../globals.css";

// ...existing font and theme configuration...

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Header />
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
