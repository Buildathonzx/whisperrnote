import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Access Required'
};

export default function AdminUnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center">
      <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
      <p className="text-muted-foreground max-w-prose mb-6">
        You attempted to access an administrative area. Your account does not have the required privileges.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
          Return Home
        </Link>
        <Link href="/profile" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
          View Profile
        </Link>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        If you believe this is an error, contact support with your account ID.
      </p>
    </div>
  );
}
