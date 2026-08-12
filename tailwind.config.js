/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        potato: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          500: 'var(--color-brand-accent)',
          600: 'var(--color-brand-primary)',
          700: 'var(--color-brand-primary-pressed)',
          900: '#4c1d95',
        },
        surface: {
          0: 'var(--color-bg-0)',
          1: 'var(--color-bg-1)',
          2: 'var(--color-bg-2)',
          3: 'var(--color-bg-3)',
          4: 'var(--color-bg-4)',
        },
      },
      fontFamily: {
        sans: ['Figtree', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontWeight: {
        // Gemini sets its display type at 320 — lighter than a normal 400,
        // heavier than a 300. Figtree's variable axis renders it for real.
        light: '320',
      },
      keyframes: {
        auroraScroll: {
          '0%':   { transform: 'rotate(-36deg) translateY(0)' },
          '100%': { transform: 'rotate(-36deg) translateY(-50%)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.85)' },
          '50%':      { opacity: '1',    transform: 'scale(1)' },
        },
      },
      animation: {
        aurora: 'auroraScroll 240s linear infinite',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
