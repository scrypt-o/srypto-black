/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode (light theme is default)
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    // Ensure all our tile background colors are included
    'bg-blue-50',
    'bg-slate-50', 
    'bg-violet-50',
    'bg-rose-50',
    'bg-emerald-50',
    'bg-amber-50',
    'bg-pink-50',
    'bg-cyan-50',
    'bg-orange-50',
    'bg-yellow-50',
    'bg-gray-50',
    // Icon colors
    'text-blue-500',
    'text-slate-500',
    'text-violet-500',
    'text-rose-500',
    'text-emerald-500',
    'text-amber-500',
    'text-pink-500',
    'text-cyan-500',
    'text-orange-500',
    'text-yellow-500',
    'text-gray-500',
  ],
  theme: {
    extend: {
      colors: {
        // Medical-grade primary palette
        primary: {
          DEFAULT: '#0066CC',
          hover: '#0052A3',
          light: '#E6F2FF',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Semantic colors for medical context
        health: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        },
        // Medical severity indicators
        severity: {
          mild: '#60A5FA',      // Light blue
          moderate: '#FBBF24',   // Amber
          severe: '#F87171',     // Light red
          critical: '#DC2626',   // Dark red
        },
        // Medical domain specific colors
        medical: {
          emergency: '#dc2626',
          prescription: '#0891b2',
          vaccine: '#16a34a',
          allergy: '#ea580c',
          lab: '#7c3aed',
          condition: '#8B5CF6',
          medication: '#10B981',
          immunization: '#3B82F6',
        },
        // Keep existing healthcare colors for backward compatibility
        'healthcare-primary': '#10b981',
        'healthcare-secondary': '#059669',
        'healthcare-accent': '#3b82f6',
        'healthcare-accent-end': '#2563eb',
        'healthcare-error': '#ef4444',
        'healthcare-warning': '#f59e0b',
        'healthcare-success': '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // New animations for UI enhancements
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-bottom': 'slideInBottom 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-in',
        'slide-out-bottom': 'slideOutBottom 0.3s ease-in',
        // Keep existing animations
        'in': 'in 0.2s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'fadeInUp': 'fadeInUp 0.4s ease-out',
        'pulse-bg': 'pulseBg 0.2s ease-out',
      },
      keyframes: {
        'slide-up': {
          from: {
            transform: 'translateY(10px)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        // New keyframes for slide animations
        'slideInRight': {
          from: {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          to: {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'slideOutRight': {
          from: {
            transform: 'translateX(0)',
            opacity: '1',
          },
          to: {
            transform: 'translateX(100%)',
            opacity: '0',
          },
        },
        'slideInBottom': {
          from: {
            transform: 'translateY(100%)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'slideOutBottom': {
          from: {
            transform: 'translateY(0)',
            opacity: '1',
          },
          to: {
            transform: 'translateY(100%)',
            opacity: '0',
          },
        },
        // Keep existing keyframes
        in: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseBg: {
          '0%': { backgroundColor: 'rgba(0, 0, 0, 0)' },
          '50%': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
          '100%': { backgroundColor: 'rgba(0, 0, 0, 0)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'hard': '0 8px 24px rgba(0, 0, 0, 0.12)',
        // Keep existing shadows
        'modern': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
        'glow': '0 0 20px rgba(5, 150, 105, 0.15)',
        'glow-lg': '0 0 40px rgba(5, 150, 105, 0.2)',
        'inner-soft': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}