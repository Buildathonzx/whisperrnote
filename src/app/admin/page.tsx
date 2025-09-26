'use client';
import React, { useState, useEffect } from 'react';

export default function AdminLanding() {
  const [status, setStatus] = useState<'idle'|'checking'|'denied'|'ok'>('idle');
  const [error, setError] = useState<string|null>(null);

  const continueHandler = async () => {
    setStatus('checking');
    setError(null);
    try {
      const res = await fetch('/api/admin/check');
      if (!res.ok) {
        setStatus('denied');
        const j = await res.json().catch(()=>({}));
        setError(j.error || 'Access denied');
        return;
      }
      window.location.href = '/admin/dashboard';
    } catch (e: any) {
      setStatus('denied');
      setError(e.message || 'Failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-24 space-y-6 text-center">
      <h1 className="text-2xl font-bold">Admin Access</h1>
      <p className="text-sm text-muted-foreground">Founder verification required.</p>
      <button onClick={continueHandler} disabled={status==='checking'} className="px-4 py-2 rounded bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50">
        {status==='checking' ? 'Checking...' : 'Continue with WhisperRNote'}
      </button>
      {status==='denied' && <div className="text-xs text-destructive">{error || 'Not authorized'}</div>}
    </div>
  );
}
