'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [bounce, setBounce] = useState(false);
  const [noteFloat, setNoteFloat] = useState(false);

  useEffect(() => {
    const bounceInterval = setInterval(() => {
      setBounce(true);
      setTimeout(() => setBounce(false), 500);
    }, 3000);

    const floatInterval = setInterval(() => {
      setNoteFloat(true);
      setTimeout(() => setNoteFloat(false), 2000);
    }, 4000);

    return () => {
      clearInterval(bounceInterval);
      clearInterval(floatInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {/* Floating decorative notes */}
        <div className="relative mb-8">
          <div className={`absolute -top-4 -left-8 w-6 h-8 bg-accent rounded-lg shadow-3d-light dark:shadow-3d-dark transform transition-transform duration-2000 ${noteFloat ? 'translate-y-2 rotate-12' : '-translate-y-1 -rotate-6'}`}></div>
          <div className={`absolute -top-2 -right-6 w-4 h-6 bg-accent/70 rounded-lg shadow-3d-light dark:shadow-3d-dark transform transition-transform duration-2000 ${noteFloat ? '-translate-y-3 -rotate-12' : 'translate-y-1 rotate-12'}`}></div>
        </div>

        {/* Main card */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-3d-light dark:shadow-3d-dark">
          {/* Giant 404 with bounce animation */}
          <div className={`text-8xl md:text-9xl font-black text-accent mb-4 transition-transform duration-500 ${bounce ? 'scale-110' : 'scale-100'}`}>
            4🤔4
          </div>

          {/* Goofy whisper note illustration */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-2xl shadow-3d-light dark:shadow-3d-dark transform -rotate-6">
                <div className="absolute inset-2 bg-card rounded-xl p-2">
                  <div className="h-1 bg-foreground/20 rounded mb-1"></div>
                  <div className="h-1 bg-foreground/20 rounded mb-1 w-3/4"></div>
                  <div className="h-1 bg-foreground/20 rounded w-1/2"></div>
                </div>
              </div>
              {/* Speech bubble */}
              <div className="absolute -top-8 -right-4 bg-foreground text-background px-3 py-1 rounded-2xl text-xs font-medium">
                &quot;Where am I?&quot;
                <div className="absolute bottom-0 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground transform translate-y-full"></div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Oops! This note got lost
          </h1>

          {/* Description */}
          <p className="text-foreground/70 mb-8 text-lg leading-relaxed">
            This page seems to have wandered off like a rogue whisper note. 
            Maybe it&apos;s hiding in someone else&apos;s collection? 🕵️‍♀️
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-accent to-accent-dark text-brown-dark px-8 py-4 rounded-2xl font-semibold shadow-3d-light dark:shadow-3d-dark hover:shadow-inner-light dark:hover:shadow-inner-dark transform transition-all duration-300 hover:scale-105 active:scale-95"
            >
              🏠 Take me home
            </button>
            
            <button
              onClick={() => router.back()}
              className="bg-card border-2 border-border text-foreground px-8 py-4 rounded-2xl font-semibold shadow-3d-light dark:shadow-3d-dark hover:shadow-inner-light dark:hover:shadow-inner-dark transform transition-all duration-300 hover:scale-105 active:scale-95"
            >
              ⬅️ Go back
            </button>
          </div>

          {/* Fun footer message */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-foreground/50 italic">
              &quot;Not all who wander are lost... but this page definitely is.&quot; 📝✨
            </p>
          </div>
        </div>

        {/* More floating decorative elements */}
        <div className="relative mt-4">
          <div className={`absolute bottom-0 left-12 w-3 h-4 bg-accent/50 rounded transform transition-transform duration-3000 ${noteFloat ? 'translate-x-4 rotate-45' : 'translate-x-0 rotate-0'}`}></div>
          <div className={`absolute bottom-2 right-8 w-5 h-3 bg-accent/30 rounded transform transition-transform duration-3000 ${noteFloat ? '-translate-x-2 -rotate-12' : 'translate-x-0 rotate-6'}`}></div>
        </div>
      </div>
    </div>
  );
}