import type { Config } from 'tailwindcss';

// Konfigurasi Tailwind TubanHub.
// - Warna brand (primary/secondary/accent/purple): hex langsung sesuai design token.
// - Token shadcn netral (background, foreground, card, dll): via CSS variable HSL.
// - Font utama: Inter (di-inject dari next/font di app/layout.tsx lewat --font-sans).
const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // --- Brand TubanHub (hex langsung) ---
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#DBEAFE',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#16A34A',
          dark: '#15803D',
          light: '#DCFCE7',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#EA580C',
          light: '#FFEDD5',
          foreground: '#FFFFFF',
        },
        purple: {
          DEFAULT: '#7C3AED',
          light: '#EDE9FE',
          foreground: '#FFFFFF',
        },

        // --- Token shadcn via CSS variable (HSL) ---
        border: 'hsl(var(--border, 214 32% 91%))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        app: '12px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
