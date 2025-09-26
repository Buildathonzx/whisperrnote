'use server';
import { redirect } from 'next/navigation';
import { getServerAdminUser } from '@/lib/admin/server';

export default async function AdminIndex() {
  const user = await getServerAdminUser();
  if (!user) {
    redirect('/admin/unauthorized');
  }
  redirect('/admin/dashboard');
}
