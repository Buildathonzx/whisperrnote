import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Box from '@mui/material/Box';
import Header from '../components/Header';
import ClientThemeProvider from '../components/ClientThemeProvider';
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
  return (
    <html lang="en">
      <body className={geist.className}>
        <ClientThemeProvider>
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
        </ClientThemeProvider>
      </body>
    </html>
  );
}
