/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Energy & Motivation Colors
        energy: {
          50: '#fff1f1',
          100: '#ffe1e1', 
          400: '#ff6b35',
          500: '#ff4757',
          600: '#ff3838',
          700: '#e53e3e'
        },
        // Health & Growth Colors
        success: {
          50: '#f0fff4',
          100: '#c6f6d5',
          400: '#7bed9f',
          500: '#2ed573',
          600: '#25c55e',
          700: '#16a34a'
        },
        // Trust & Reliability Colors
        health: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#70a1ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        // Premium Accents
        premium: {
          50: '#f5f3ff',
          100: '#ede9fe',
          400: '#8b5cf6',
          500: '#5742ff',
          600: '#7c3aed',
          700: '#6d28d9'
        },
        // Achievement Colors
        achievement: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#ffa502',
          600: '#d97706',
          700: '#b45309'
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-energy': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-energy': 'bounce 1s infinite',
      }
    },
  },
  plugins: [],
}