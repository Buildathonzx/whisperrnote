"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  UserGroupIcon,
  RectangleStackIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: <UserGroupIcon className="h-8 w-8 text-accent" />,
    title: 'Real-time Collaboration',
    description:
      "Work on notes together, see changes instantly, and keep the creative flow going without missing a beat.",
  },
  {
    icon: <RectangleStackIcon className="h-8 w-8 text-accent" />,
    title: 'Structured Workspaces',
    description:
      'Organize your work with dedicated spaces for projects or teams. Keep everything tidy and accessible for everyone.',
  },
  {
    icon: <CheckBadgeIcon className="h-8 w-8 text-accent" />,
    title: 'Actionable Notes',
    description:
      'Turn discussions into do-lists. Assign tasks, set deadlines, and track progress right inside your notes.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-dark-bg text-dark-fg">
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-dark-border bg-dark-bg/80 px-10 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 text-accent">
            <svg
              fill="currentColor"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-dark-fg">WhisperNote</h2>
        </div>
        <nav className="hidden flex-1 justify-center gap-8 md:flex">
          <a
            className="text-sm font-medium text-gray-400 transition-colors hover:text-dark-fg"
            href="#"
          >
            Product
          </a>
          <a
            className="text-sm font-medium text-gray-400 transition-colors hover:text-dark-fg"
            href="#"
          >
            Solutions
          </a>
          <a
            className="text-sm font-medium text-gray-400 transition-colors hover:text-dark-fg"
            href="#"
          >
            Resources
          </a>
          <a
            className="text-sm font-medium text-gray-400 transition-colors hover:text-dark-fg"
            href="#"
          >
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative flex items-center justify-center py-24 text-center md:py-32">
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-dark-bg via-dark-bg/80 to-dark-bg"></div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMQEOUV-9C3ZJc3BofI_w3F_doogjsVsJxe1vWGKJuQsSj61Vg1Kqux0Bdto2ZoxIT7xisNzezSFSuFHVZPXklUZpEDG_M_eawFaLUihrA5xZh6KlJHnnfEDHw73X7XLUsMTF0f8fJLVVO8q_PCoGe-PvuPOg-COWYdn6-ov54hSObVg4R-co6GF-RB44pjzpe3FGFiCh8HuVuZobR8Cn9fRD5-rFeBPw1C8OcATbu26uGJpyLLBbykz2xnvNmmnM7mq65BsG88MpZ")',
            }}
          ></div>
          <div className="container relative z-10 mx-auto px-5">
            <h1 className="mb-4 text-4xl font-black leading-tight tracking-tighter text-transparent md:text-6xl bg-clip-text bg-gradient-to-br from-white to-gray-400">
              Your Ideas, United.
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-400 md:text-xl">
              WhisperNote is the fluid, collaborative workspace where your
              team's best ideas take shape. Capture, organize, and act on
              inspiration, together in real-time.
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">Sign up for free</Link>
            </Button>
          </div>
        </section>
        <section className="bg-dark-card py-20 md:py-28">
          <div className="container mx-auto px-5">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-dark-fg md:text-4xl">
                Everything you need to collaborate
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                From brainstorming sessions to project roadmaps, WhisperNote
                provides the tools to keep your team in sync.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="flex flex-col gap-4 bg-[#1A2532]">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-xl font-bold text-dark-fg">
                      {feature.title}
                    </CardTitle>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-solid border-dark-border bg-dark-bg">
        <div className="container mx-auto px-5 py-12">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-6 flex flex-wrap justify-center gap-6 md:mb-0 md:justify-start">
              <a
                className="text-sm text-gray-400 transition-colors hover:text-dark-fg"
                href="#"
              >
                About
              </a>
              <a
                className="text-sm text-gray-400 transition-colors hover:text-dark-fg"
                href="#"
              >
                Contact
              </a>
              <a
                className="text-sm text-gray-400 transition-colors hover:text-dark-fg"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-sm text-gray-400 transition-colors hover:text-dark-fg"
                href="#"
              >
                Terms of Service
              </a>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 WhisperNote. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}