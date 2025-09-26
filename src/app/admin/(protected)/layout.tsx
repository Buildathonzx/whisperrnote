'use server';
import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser as getAuthUser } from '@/lib/auth';
import { getCurrentUser as getAppwriteUser } from '@/lib/appwrite';

async function getAdminUser() {
  let user: any = null;
  try { user = await getAuthUser(); } catch {}
  if (!user) { try { user = await getAppwriteUser(); } catch {} }
  if (!user || !user.$id) return null;
  const prefs = (user as any).prefs || {};
  const labels: string[] = Array.isArray(user.labels) ? user.labels : [];
  const adminPref = prefs.admin === true || prefs.admin === 'true' || prefs.admin === 1 || prefs.admin === '1';
  const labelAdmin = labels.includes('admin') || labels.includes('Admin');
  if (adminPref || labelAdmin) return user;
  return null;
}

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) {
    redirect('/admin/unauthorized');
  }
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
