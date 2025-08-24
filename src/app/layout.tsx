"use client";

import "../globals.css";
import { AppWithLoading } from "@/components/ui/AppWithLoading";
import { AuthProvider } from "@/components/ui/AuthContext";
import { OverlayProvider } from "@/components/ui/OverlayContext";
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
              {children}
              <Overlay />
            </OverlayProvider>
          </AuthProvider>
        </AppWithLoading>
      </body>
    </html>
  );
}
