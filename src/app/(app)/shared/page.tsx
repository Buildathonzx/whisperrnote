"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import {
  HomeIcon,
  BellIcon,
  PlusCircleIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const sharedNotes = [
  {
    title: 'Project Brainstorm',
    collaborators: 'Alex, Jordan, Taylor',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAG9QiSan10ioOZ1knuOPbrQAbYlLbVP30UW_v4BDLPh_k95QXZujrTc5nBGp0qqVSM-BJxOWmsx8hgHByYNhaNb2G6NYja4uDrvGmytQcOyo8WTM9VwPT-Wsm4YHftydf4nO_EoNuZBAlAFrKoQLTOpuyzRJS6P1WQW1XuTRxXPJMVQKbwHSq2HfG4tTJeZ0a737dAgKIUldO2CFJKhK0roBj_cJni5hK1eDx68-19OBmTgdoetmCntNimV4EnVfTjpBB3-AIpFW1l',
  },
  {
    title: 'Meeting Notes',
    collaborators: 'Alex, Taylor',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo2X3cqY1HF-oRLJAfBD81itASvlgpQRn4mIeTyXfCK399F8JHzpsY7-rtxWquoYTRXbhm3_f8_upaP5pkN6PH6lXjXrkl67y_PAd-GcwihpuWNvc-eeuE2Dq_U98NlCKJe_isS6zqilK4NTwxwoIZuOdg5SdMozIbH9ntJezLXQbgSNOAJ6eigZpXCi4w2-b0KRYiMWMpkBYDcvgmHdAPmX6sShUnNB6gvXSQOPawayENs-zZ3mILIPrpYQJ_nwiLZXS8oI4k0LBo',
  },
  {
    title: 'Research Findings',
    collaborators: 'Alex, Jordan',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGj4e6BZ_fdpzZ65o67n1E15T1JjT3bZsIgmKvi34WgkopnamHldx_mVag9PO1YyMVbhox6B9YrEivcW_6AAp5sNlyzsOJzjEGJcKG__M7z4E1-HyxoSyZAnolO8ZeVogW_DgtRAQEvrALcdC9y6IY2OdhwPeA9jcJGV9o1CBhVIth04qdh1ESQSfeY7DButR9acm9bPSyOk-7IzUoYAzQkbBv4yXY2YU4OCacULfQlnhV3ZsGiYQOak7gVltoVYMvqOkW_DDnYDc_',
  },
  {
    title: 'Client Feedback',
    collaborators: 'Alex, Jordan, Taylor',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUSBNnzmhb51V6jspXxHv_COCHGQNidX3Gm5NuKCDRprHmHPusG8vztS9U6bdyJG0f-ttdYE8ITxtFmMsK0dzkzgLyHzbLq_cPL-O2EQ-KZoEMttrxwcLvKOFNTXAtJ76V_6aIhWklZktdxLkBWs35iuATeTlQglRFASDkZhIKWMnswp_pj7Bsy8ctt8uLUNkBfQDyf_0DbhHtfmR994XKu6TeHBeXl0saZuBdVyNvWHt8A6VpnKtERpWBsEaQrMscRx39eX2KeNAb',
  },
];

export default function SharedNotesPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-light-bg text-dark-fg">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-dark-border bg-light-bg/80 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-xl font-bold text-dark-fg">
            NoteShare
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="secondary">
            <MagnifyingGlassIcon className="h-6 w-6" />
          </Button>
          <Button size="icon">
            <PlusCircleIcon className="h-6 w-6" />
          </Button>
        </div>
      </header>
      <main className="flex-grow px-4 py-8 sm:px-6">
        <h2 className="font-serif text-4xl font-extrabold text-dark-fg mb-8">
          Shared Notes
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {sharedNotes.map((note, index) => (
            <div key={index} className="group flex flex-col">
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl border-2 border-dark-border bg-gray-200 card-shadow card-shadow-hover transition-all duration-300">
                <img
                  alt={note.title}
                  className="h-full w-full object-cover"
                  src={note.imageUrl}
                />
              </div>
              <div className="pt-4">
                <h3 className="font-serif text-lg font-bold leading-tight text-dark-fg">
                  {note.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {note.collaborators}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="sticky bottom-0 z-10 border-t border-dark-border bg-light-bg/80 backdrop-blur-sm">
        <nav className="flex h-20 items-center justify-around px-2">
          <a
            href="#"
            className="flex w-1/4 flex-col items-center justify-center text-gray-500"
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
          </a>
          <a
            href="#"
            className="flex w-1/4 flex-col items-center justify-center text-gray-500"
          >
            <PlusCircleIcon className="h-6 w-6" />
            <span className="text-xs font-medium">Notes</span>
          </a>
          <a
            href="#"
            className="relative flex w-1/4 flex-col items-center justify-center text-accent"
          >
            <div className="absolute -top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow-lg">
              Shared
            </div>
            <UserIcon className="h-6 w-6" />
          </a>
          <a
            href="#"
            className="flex w-1/4 flex-col items-center justify-center text-gray-500"
          >
            <BellIcon className="h-6 w-6" />
            <span className="text-xs font-medium">Updates</span>
          </a>
        </nav>
      </footer>
    </div>
  );
}