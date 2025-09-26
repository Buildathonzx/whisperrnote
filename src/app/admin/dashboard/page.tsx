'use server';
import { redirect } from 'next/navigation';

export default async function LegacyDashboardRedirect() {
  redirect('/admin/(protected)/dashboard');
}
