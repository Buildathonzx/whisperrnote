"use client";

import { useTheme } from "@/components/ThemeProvider";

export function ThemeTest() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="p-4 bg-card border border-border rounded-xl">
      <h3 className="text-lg font-bold mb-2">Theme System Test</h3>
      <p className="mb-4">Current theme: <strong>{theme}</strong></p>
      <button 
        onClick={toggleTheme}
        className="btn-3d px-4 py-2 bg-accent text-white"
      >
        Toggle Theme
      </button>
      <div className="mt-4 p-2 bg-background text-foreground rounded-lg">
        <p>This text uses CSS variable colors that should change with theme</p>
      </div>
    </div>
  );
}