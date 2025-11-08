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
        // 主色調 - 藍色系
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',    // 主色
          700: '#1d4ed8',
          800: '#1e40af',    // 深色
          900: '#1e3a8a',
        },
        // 強調色 - 金色系
        accent: {
          light: '#f4d03f',
          DEFAULT: '#d4af37',
          dark: '#b8a082',
        },
        // 語義化顏色（對應 SCSS 常數）
        'text-primary-light': '#0f172a',
        'text-secondary-light': '#334155',
        'text-muted-light': '#64748b',
        'bg-main-light': '#f8fafc',
        'bg-card-light': '#ffffff',
        'border-light': '#e2e8f0',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'Times', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'glow': 'glow 3s ease-in-out infinite',
        'float': 'float 20s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px) scale(0.95)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.2)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(37, 99, 235, 0.4)',
          },
        },
        float: {
          '0%, 100%': { 
            opacity: '0.8',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.05)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

