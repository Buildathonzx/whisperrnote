'use client';
import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-sm text-muted-foreground">Manage application configurations and messaging.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <a href="/admin/messages" className="border rounded-lg p-4 hover:bg-muted/40 transition">
          <h2 className="font-semibold mb-1">Broadcast Messages</h2>
          <p className="text-xs text-muted-foreground">Send announcements or targeted emails to users.</p>
        </a>
        <div className="border rounded-lg p-4 opacity-70">
          <h2 className="font-semibold mb-1">Coming Soon</h2>
          <p className="text-xs text-muted-foreground">More management tools will appear here.</p>
        </div>
      </div>
    </div>
  );
}
