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
        cyber: {
          950: '#070A11',
          900: '#0B0F19',
          850: '#0F1626',
          800: '#141E33',
          700: '#1F2D4A',
          600: '#2A3C61',
          accent: '#38BDF8',
          purple: '#818CF8',
          neon: '#06B6D4',
        },
        risk: {
          low: '#10B981',
          medium: '#F59E0B',
          high: '#F97316',
          critical: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(56, 189, 248, 0.2), 0 0 20px rgba(56, 189, 248, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(56, 189, 248, 0.6), 0 0 30px rgba(56, 189, 248, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}
