'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { useState, useMemo } from 'react';
import "../globals.css";
import AppShell from "@/components/ui/appShell";
import { AppWithLoading } from "@/components/ui/AppWithLoading";
import { usePathname } from "next/navigation";
import { lightTheme, darkTheme } from '../theme';

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
    () => (mode === 'light' ? lightTheme : darkTheme),
    [mode]
  );

  const PUBLIC_ROUTES = [
    "/blog", /^\/blog\/[^\/]+$/, "/reset", "/verify", "/login", "/signup"
  ];
  function isPublicRoute(path: string) {
    return PUBLIC_ROUTES.some(route =>
      typeof route === "string" ? route === path : route instanceof RegExp && route.test(path)
    );
  }

  const content = (
    <AppWithLoading>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          component="main"
          className="animated-content"
          sx={{
            minHeight: '100vh',
          }}
        >
          {isPublicRoute(pathname)
            ? children
            : <AppShell toggleTheme={toggleTheme} isDarkMode={mode === 'dark'}>{children}</AppShell>
          }
        </Box>
      </ThemeProvider>
    </AppWithLoading>
  );

  return (
    <html lang="en">
      <body>
        {content}
      </body>
    </html>
  );
}
