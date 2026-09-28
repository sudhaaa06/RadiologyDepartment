/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070B12',
        panel: {
          DEFAULT: '#0D131D',
          hover: '#131C2B',
          card: '#111927',
          elevated: '#162234',
        },
        border: {
          DEFAULT: '#1D2A38',
          subtle: '#16212E',
          accent: '#26374D',
          highlight: 'rgba(0, 217, 255, 0.4)',
        },
        cyan: {
          accent: '#00D9FF',
          glow: 'rgba(0, 217, 255, 0.15)',
          deep: '#0891b2',
        },
        violet: {
          accent: '#8B7CFF',
          glow: 'rgba(139, 124, 255, 0.15)',
        },
        amber: {
          warn: '#FFB547',
          glow: 'rgba(255, 181, 71, 0.15)',
        },
        crimson: {
          crit: '#FF5C6C',
          glow: 'rgba(255, 92, 108, 0.15)',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '18px',
        '3xl': '22px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 217, 255, 0.22)',
        'glow-cyan-sm': '0 0 10px -2px rgba(0, 217, 255, 0.3)',
        'glow-violet': '0 0 20px -3px rgba(139, 124, 255, 0.22)',
        'glow-amber': '0 0 16px -2px rgba(255, 181, 71, 0.2)',
        'panel': '0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(29, 42, 56, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
