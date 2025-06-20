/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Colors (UI/UX仕様書準拠)
        'primary-blue': '#3B82F6',     // Blue-500
        'primary-purple': '#8B5CF6',   // Purple-500
        
        // Status Colors
        'success-green': '#10B981',    // Green-500
        'warning-amber': '#F59E0B',    // Amber-500
        'error-red': '#EF4444',        // Red-500
        
        // Gray Scale (完全仕様書準拠)
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        
        // Background Colors (Light Mode)
        'bg-primary': '#F9FAFB',       // Gray-50
        'bg-secondary': '#FFFFFF',     // White
        'bg-tertiary': '#F3F4F6',      // Gray-100
        
        // Dark Mode Backgrounds
        'dark-bg-primary': '#111827',   // Gray-900
        'dark-bg-secondary': '#1F2937', // Gray-800
        'dark-bg-tertiary': '#374151',  // Gray-700
        
        // Text Colors (Light Mode)
        'text-primary': '#111827',      // Gray-900
        'text-secondary': '#4B5563',    // Gray-600
        'text-tertiary': '#6B7280',     // Gray-500
        'text-quaternary': '#9CA3AF',   // Gray-400
        
        // Dark Mode Text
        'dark-text-primary': '#F9FAFB', // Gray-50
        'dark-text-secondary': '#D1D5DB', // Gray-300
        'dark-text-tertiary': '#9CA3AF', // Gray-400
        
        // Dark Mode Primary Colors
        'dark-primary-blue': '#60A5FA', // Blue-400
        'dark-success-green': '#34D399', // Green-400
      },
      
      // Typography (UI/UX仕様書準拠)
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', '16px'],     // line-height: 16px
        'sm': ['14px', '20px'],     // line-height: 20px
        'base': ['16px', '24px'],   // line-height: 24px
        'lg': ['18px', '28px'],     // line-height: 28px
        'xl': ['20px', '28px'],     // line-height: 28px
        '2xl': ['24px', '32px'],    // line-height: 32px
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      
      // Spacing System (4px基準)
      spacing: {
        '1': '4px',   // $space-1
        '2': '8px',   // $space-2
        '3': '12px',  // $space-3
        '4': '16px',  // $space-4
        '5': '20px',  // $space-5
        '6': '24px',  // $space-6
        '8': '32px',  // $space-8
        '10': '40px', // $space-10
        '12': '48px', // $space-12
        '16': '64px', // $space-16
      },
      
      // Border Radius (UI/UX仕様書準拠)
      borderRadius: {
        'sm': '4px',     // $rounded-sm
        'md': '8px',     // $rounded-md
        'lg': '12px',    // $rounded-lg
        'xl': '16px',    // $rounded-xl
        '2xl': '24px',   // $rounded-2xl
        'full': '9999px', // $rounded-full
      },
      
      // Shadows (UI/UX仕様書準拠)
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      
      // Animations (UI/UX仕様書準拠)
      animation: {
        'fadeIn': 'fadeIn 300ms ease-out',
        'slideDown': 'slideDown 300ms ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 2s linear infinite',
        'scale-up': 'scale-up 200ms ease-out',
        'scale-down': 'scale-down 100ms ease-out',
      },
      
      // Keyframes (UI/UX仕様書準拠)
      keyframes: {
        fadeIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideDown: {
          'from': {
            opacity: '0',
            maxHeight: '0',
          },
          'to': {
            opacity: '1',
            maxHeight: '2000px',
          },
        },
        'scale-up': {
          'from': {
            transform: 'scale(1)',
          },
          'to': {
            transform: 'scale(1.05)',
          },
        },
        'scale-down': {
          'from': {
            transform: 'scale(1)',
          },
          'to': {
            transform: 'scale(0.98)',
          },
        },
      },
      
      // Background Gradients (UI/UX仕様書準拠)
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #3B82F6, #8B5CF6)',
        'gradient-purple-pink': 'linear-gradient(to right, #8B5CF6, #EC4899)',
        'gradient-blue-purple': 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      },
      
      // Transition Timings (UI/UX仕様書準拠)
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      
      // Easing Functions (UI/UX仕様書準拠)
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      
      // Z-index Layers (UI/UX仕様書準拠)
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
    },
  },
  plugins: [],
}