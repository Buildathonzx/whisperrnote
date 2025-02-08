import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Header from '@/components/NoteCard';
import "../globals.css";

const geist = Geist({
  subsets: ["latin"],
});

const theme = createTheme({
  palette: {
    mode: 'light',
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
  return (
    <html lang="en">
      <body className={geist.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Header />
          <Box component="main" sx={{ 
            minHeight: '100vh',
            pt: '64px', // Height of AppBar
          }}>
            {children}
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
