/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors (UI/UX仕様書準拠)
        primary: {
          blue: '#3B82F6',      // Blue-500
          purple: '#8B5CF6',    // Purple-500
        },
        // Status Colors
        status: {
          success: '#10B981',   // Green-500
          warning: '#F59E0B',   // Amber-500
          error: '#EF4444',     // Red-500
        },
        // Background Colors
        background: {
          primary: '#F9FAFB',   // Gray-50
          secondary: '#FFFFFF', // White
          tertiary: '#F3F4F6',  // Gray-100
        },
        // Dark mode backgrounds
        dark: {
          primary: '#111827',   // Gray-900
          secondary: '#1F2937', // Gray-800
          tertiary: '#374151',  // Gray-700
        }
      },
      spacing: {
        // 仕様書のスペーシングシステム
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      fontSize: {
        // 仕様書のタイポグラフィ
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'lg': ['18px', '28px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 300ms ease-out',
        'slideDown': 'slideDown 300ms ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        slideDown: {
          'from': {
            opacity: '0',
            maxHeight: '0'
          },
          'to': {
            opacity: '1',
            maxHeight: '2000px'
          }
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #3B82F6, #8B5CF6)',
        'gradient-purple-pink': 'linear-gradient(to right, #8B5CF6, #EC4899)',
        'gradient-blue-purple': 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      }
    },
  },
  plugins: [],
}