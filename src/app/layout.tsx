"use client";

import "../globals.css";
import { AppWithLoading } from "@/components/ui/AppWithLoading";
import { AuthProvider } from "@/components/ui/AuthContext";
import { OverlayProvider } from "@/components/ui/OverlayContext";
import { SubscriptionProvider } from "@/components/ui/SubscriptionContext";
import { RouteGuard } from "@/components/ui/RouteGuard";
import { AuthModalContainer } from "@/components/ui/AuthModalContainer";
import { ThemeProvider } from "@/components/ThemeProvider";
import Overlay from "@/components/ui/Overlay";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AppWithLoading>
            <AuthProvider>
              <SubscriptionProvider>
                <OverlayProvider>
                  <RouteGuard>
                    {children}
                  </RouteGuard>
                  <AuthModalContainer />
                  <Overlay />
                </OverlayProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </AppWithLoading>
        </ThemeProvider>
      </body>
    </html>
  );
}
