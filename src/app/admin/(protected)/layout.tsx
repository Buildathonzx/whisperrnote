'use server';
import React from 'react';
import { redirect } from 'next/navigation';
import { getServerAdminUser } from '@/lib/admin/server';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerAdminUser();
  if (!user) {
    redirect('/admin/unauthorized');
  }
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
