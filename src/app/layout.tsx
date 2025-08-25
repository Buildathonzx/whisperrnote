"use client";

import "../globals.css";
import { AppWithLoading } from "@/components/ui/AppWithLoading";
import { AuthProvider } from "@/components/ui/AuthContext";
import { OverlayProvider } from "@/components/ui/OverlayContext";
import { RouteGuard } from "@/components/ui/RouteGuard";
import { AuthModalContainer } from "@/components/ui/AuthModalContainer";
import Overlay from "@/components/ui/Overlay";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppWithLoading>
          <AuthProvider>
            <OverlayProvider>
              <RouteGuard>
                {children}
              </RouteGuard>
              <AuthModalContainer />
              <Overlay />
            </OverlayProvider>
          </AuthProvider>
        </AppWithLoading>
      </body>
    </html>
  );
}
