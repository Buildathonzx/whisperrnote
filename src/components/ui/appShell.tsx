"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/appwrite";

const PUBLIC_ROUTES = [
  "/", "/blog", /^\/blog\/[^\/]+$/, "/reset", "/verify", "/login", "/signup"
];

function isPublicRoute(path: string) {
  return PUBLIC_ROUTES.some(route =>
    typeof route === "string" ? route === path : route instanceof RegExp && route.test(path)
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>;
}
