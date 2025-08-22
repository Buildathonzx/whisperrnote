"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/appwrite";
import Navigation from "../Navigation";
import { Box } from "@mui/material";
import PageHeader from "../PageHeader";

const PUBLIC_ROUTES = [
  "/", "/blog", /^\/blog\/[^\/]+$/, "/reset", "/verify", "/login", "/signup"
];

function isPublicRoute(path: string) {
  return PUBLIC_ROUTES.some(route =>
    typeof route === "string" ? route === path : route instanceof RegExp && route.test(path)
  );
}

interface AppShellProps {
  children: React.ReactNode;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export default function AppShell({ children, toggleTheme, isDarkMode }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isPublicRoute(pathname)) {
      setAuthChecked(true);
      return;
    }
    getCurrentUser()
      .then(user => {
        if (!user) router.replace("/login");
        setAuthChecked(true);
      })
      .catch(() => {
        router.replace("/login");
        setAuthChecked(true);
      });
  }, [pathname, router]);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Navigation toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          ml: { md: `240px` },
          mb: { xs: '56px', md: 0 },
        }}
      >
        <PageHeader />
        {children}
      </Box>
    </Box>
  );
}
