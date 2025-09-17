"use client";

import "../globals.css";
import { AppWithLoading } from "@/components/ui/AppWithLoading";
import { AuthProvider } from "@/components/ui/AuthContext";
import { OverlayProvider } from "@/components/ui/OverlayContext";
import { SubscriptionProvider } from "@/components/ui/SubscriptionContext";
import { RouteGuard } from "@/components/ui/RouteGuard";
import { AuthModalContainer } from "@/components/ui/AuthModalContainer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AIProvider } from "@/components/ui/AIContext";
import { ToastProvider } from "@/components/ui/Toast";
import Overlay from "@/components/ui/Overlay";
import { ContextMenuProvider } from "@/components/ui/ContextMenuContext";
import { GlobalContextMenu } from "@/components/ui/GlobalContextMenu";
import GlobalShortcuts from "@/components/GlobalShortcuts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ToastProvider>
            <AppWithLoading>
              <AuthProvider>
                <SubscriptionProvider>
                  <OverlayProvider>
                     <AIProvider>
                        <ContextMenuProvider>
                          <RouteGuard>
                            {children}
                          </RouteGuard>
                          <AuthModalContainer />
                          <Overlay />
                          <GlobalContextMenu />
                          <GlobalShortcuts />
                        </ContextMenuProvider>
                     </AIProvider>
                  </OverlayProvider>
                </SubscriptionProvider>
              </AuthProvider>
            </AppWithLoading>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
