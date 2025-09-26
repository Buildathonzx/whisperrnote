'use client';
import React, { useEffect } from 'react';
import { useAdminGate } from '@/hooks/useAdminGate';

export default function AdminLanding() {
  const { loading, authorized, error, refresh } = useAdminGate();

  useEffect(() => {
    if (!loading && authorized) {
      window.location.href = '/admin/dashboard';
    }
  }, [loading, authorized]);

  return (
    <div className="max-w-sm mx-auto mt-24 space-y-6 text-center">
      <h1 className="text-2xl font-bold">Admin Access</h1>
      <p className="text-sm text-muted-foreground">Founder verification required.</p>
      {!authorized && (
        <button onClick={refresh} disabled={loading} className="px-4 py-2 rounded bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50">
          {loading ? 'Checking...' : 'Retry Admin Check'}
        </button>
      )}
      {!loading && !authorized && error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}
