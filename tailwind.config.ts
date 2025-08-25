import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brown-dark': '#2d221e',
        'brown-light': '#f5f2f0',
        'ash-dark': '#3c3c3c',
        'ash-light': '#f3f3f3',
        'sun-yellow': '#ffc700',
        'sun-yellow-dark': '#d9a900',

        // Light mode
        'light-bg': '#f3f3f3', // ash-light
        'light-fg': '#2d221e', // brown-dark
        'light-card': '#ffffff',
        'light-border': '#e0e0e0',

        // Dark mode
        'dark-bg': '#1a1a1a', // very dark ash
        'dark-fg': '#f5f2f0', // brown-light
        'dark-card': '#252525',
        'dark-border': '#424242',

        // Accent
        'accent': '#ffc700', // sun-yellow
        'accent-dark': '#d9a900',

        // CSS variable-based colors
        'background': 'var(--background)',
        'foreground': 'var(--foreground)',
        'card': 'var(--card)',
        'border': 'var(--border)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        '3d-light': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '3d-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'inner-light': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-delayed': 'fadeIn 0.5s ease-out',
        'progress': 'progress 2s ease-in-out infinite',
        'float-1': 'float1 3s ease-in-out infinite',
        'float-2': 'float2 3.5s ease-in-out infinite 0.5s',
        'float-3': 'float3 4s ease-in-out infinite 1s',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'float-slow-reverse': 'floatSlowReverse 7s ease-in-out infinite 2s',
      },
      keyframes: {
        fadeIn: {
          'from': {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        progress: {
          '0%': { width: '0%' },
          '50%': { width: '100%' },
          '100%': { width: '0%' },
        },
        float1: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(5deg)' },
        },
        float2: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(-3deg)' },
        },
        float3: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(8deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-5px) translateX(5px) rotate(2deg)' },
          '50%': { transform: 'translateY(-10px) translateX(0px) rotate(0deg)' },
          '75%': { transform: 'translateY(-5px) translateX(-5px) rotate(-2deg)' },
        },
        floatSlowReverse: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-8px) translateX(-8px) rotate(-3deg)' },
          '50%': { transform: 'translateY(-15px) translateX(0px) rotate(0deg)' },
          '75%': { transform: 'translateY(-8px) translateX(8px) rotate(3deg)' },
        },
      }
    },
  },
  plugins: [],
};

export default config;
