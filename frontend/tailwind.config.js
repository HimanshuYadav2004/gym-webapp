/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand accent — bold athletic red, used for CTAs, active states, key figures
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Deep neutral scale for the sidebar / dark surfaces
        ink: {
          50: '#f6f7f9',
          100: '#eceef1',
          200: '#d5d9e0',
          300: '#adb4c0',
          400: '#7d879a',
          500: '#5b6478',
          600: '#454d5f',
          700: '#363c4b',
          800: '#22262f',
          900: '#16181e',
          950: '#0c0d11',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Anton"', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 18 24 / 0.04), 0 1px 3px 0 rgb(15 18 24 / 0.06)',
        card: '0 1px 2px 0 rgb(15 18 24 / 0.03), 0 8px 24px -8px rgb(15 18 24 / 0.10)',
        lift: '0 12px 32px -12px rgb(15 18 24 / 0.22)',
        glow: '0 0 0 1px rgb(239 68 68 / 0.15), 0 8px 24px -8px rgb(239 68 68 / 0.35)',
      },
    },
  },
  plugins: [],
}
