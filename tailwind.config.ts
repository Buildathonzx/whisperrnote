import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'dark-brown': '#3E2723',
        'medium-brown': '#5D4037',
        'light-brown': '#8D6E63',
        'brownish-white': '#F5F5F5',
        'dark-paper': '#4E342E',
        'sun-yellow': '#FFC107',
        'sun-yellow-dark': '#FFA000',
      },
    },
  },
  plugins: [],
} satisfies Config;
