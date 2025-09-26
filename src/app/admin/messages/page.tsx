'use server';
import { redirect } from 'next/navigation';
export default async function LegacyMessagesRedirect(){ redirect('/admin/(protected)/messages'); }
