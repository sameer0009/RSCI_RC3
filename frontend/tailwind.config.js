/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Navy blue, derived from the Riphah School of Computing & Innovation crest
        primary: {
          50: '#eef4fb',
          100: '#d9e6f4',
          200: '#b3cce9',
          300: '#82abd9',
          400: '#4f7fc0',
          500: '#2f5fa3',
          600: '#1f4680',
          700: '#193865',
          800: '#152c4f',
          900: '#0e1e37',
          950: '#091326',
        },
        // Gold trim from the crest, used sparingly as the brand accent
        gold: {
          50: '#fdf9ec',
          100: '#faf0cb',
          200: '#f3dd92',
          300: '#eac657',
          400: '#e0af31',
          500: '#c9941f',
          600: '#a8741a',
          700: '#86571a',
          800: '#6f461b',
          900: '#5e3b1c',
        },
        dark: {
          bg: '#0a0e1a',
          card: '#151b2e',
          border: '#1f2937',
          hover: '#1e293b',
        },
        accent: {
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b',
          purple: '#8b5cf6',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(31, 70, 128, 0.45)',
        'glow-lg': '0 0 30px rgba(31, 70, 128, 0.55)',
        'gold-glow': '0 0 20px rgba(201, 148, 31, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
