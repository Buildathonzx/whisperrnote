'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-lg bg-light-card/95 dark:bg-dark-card/95 rounded-3xl shadow-3d-light dark:shadow-3d-dark border border-light-border/20 dark:border-dark-border/20 overflow-hidden">
            <div className="p-6">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img
                  src="/logo/whisperrnote.png"
                  alt="WhisperrNote Logo"
                  className="w-16 h-16 rounded-2xl shadow-card-light dark:shadow-card-dark"
                />
              </div>

              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <svg
                  className="w-16 h-16 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* Header */}
              <h1 className="text-2xl font-bold text-center text-foreground mb-4">
                Application Error
              </h1>

              {/* Error Message */}
              <p className="text-center text-foreground/70 mb-6">
                A critical error occurred in the application. Please refresh the page or contact support if the problem persists.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6">
                  <details className="text-left">
                    <summary className="text-sm cursor-pointer text-accent hover:text-accent-hover mb-2">
                      Error Details
                    </summary>
                    <pre className="text-xs bg-card p-3 rounded-lg border border-border overflow-auto max-h-32 whitespace-pre-wrap">
                      {error.message}
                      {error.stack && `\n\n${error.stack}`}
                    </pre>
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={reset}
                  className="w-full bg-accent hover:bg-accent-hover text-brown-darkest py-3 px-4 rounded-xl font-medium transition-all shadow-3d-light dark:shadow-3d-dark hover:shadow-3d-hover-light dark:hover:shadow-3d-hover-dark flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reload Application
                </button>

                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-transparent hover:bg-card text-foreground py-2 px-4 rounded-xl font-medium transition-colors border border-border"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}