/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#050d0a',
        cards: 'rgba(0, 20, 10, 0.6)',
        primary: {
          DEFAULT: '#00ff41',
          dim: '#00cc33',
          foreground: '#000000',
        },
        accent: {
          DEFAULT: '#ffd700',
          dim: '#b8960c',
          foreground: '#000000',
        },
        neon: {
          green: '#00ff41',
          cyan: '#00f2ff',
          purple: '#bf00ff',
          pink: '#ff00a0',
        },
        gold: {
          DEFAULT: '#ffd700',
          dim: '#b8960c',
        },
        silver: '#c0c0c0',
        bronze: '#cd7f32',
        success: '#00ff41',
        error: '#ff4444',
        warning: '#ffaa00',
        danger: '#ff2244',
        terminal: {
          magenta: '#ff00ff',
          green: '#00ff41',
          bg: '#000000',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Courier New"', 'Courier', 'monospace'],
        terminal: ['"VT323"', '"Courier New"', 'monospace'],
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 3s infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'aurora': 'aurora 12s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'hologram': 'hologram 4s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'matrix-fade': 'matrix-fade 4s linear infinite',
        'border-flow': 'border-flow 3s linear infinite',
        'count-up': 'count-up 1s ease-out',
        'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'dash': 'dash 20s linear infinite',
        'broadcast': 'broadcast 1.5s ease-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        glitch: {
          '0%, 100%': { clipPath: 'inset(0 0 100% 0)', transform: 'translate(0)' },
          '5%': { clipPath: 'inset(10% 0 80% 0)', transform: 'translate(-2px, 2px)' },
          '10%': { clipPath: 'inset(70% 0 10% 0)', transform: 'translate(2px, -2px)' },
          '15%': { clipPath: 'inset(0 0 100% 0)', transform: 'translate(0)' },
          '95%': { clipPath: 'inset(0 0 100% 0)', transform: 'translate(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        aurora: {
          '0%': { transform: 'translate(0%, 0%) scale(1)', opacity: '0.4' },
          '33%': { transform: 'translate(5%, -3%) scale(1.1)', opacity: '0.6' },
          '66%': { transform: 'translate(-3%, 5%) scale(0.95)', opacity: '0.3' },
          '100%': { transform: 'translate(2%, -2%) scale(1.05)', opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        hologram: {
          '0%, 100%': { opacity: '0.85', filter: 'hue-rotate(0deg)' },
          '25%': { opacity: '1', filter: 'hue-rotate(5deg)' },
          '50%': { opacity: '0.9', filter: 'hue-rotate(-5deg)' },
          '75%': { opacity: '0.95', filter: 'hue-rotate(3deg)' },
        },
        'neon-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 20px #00ff41' },
          '50%': { boxShadow: '0 0 10px #00ff41, 0 0 25px #00ff41, 0 0 50px #00ff41' },
        },
        'matrix-fade': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(20px)' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-40px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(40px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 8px currentColor)' },
          '50%': { filter: 'brightness(1.3) drop-shadow(0 0 20px currentColor)' },
        },
        'broadcast': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        dash: {
          to: { strokeDashoffset: '-1000' }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon-green': '0 0 10px rgba(0,255,65,0.5), 0 0 40px rgba(0,255,65,0.2)',
        'neon-cyan': '0 0 10px rgba(0,242,255,0.5), 0 0 40px rgba(0,242,255,0.2)',
        'neon-gold': '0 0 10px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.2)',
        'neon-red': '0 0 10px rgba(255,68,68,0.5), 0 0 40px rgba(255,68,68,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card': '0 4px 24px rgba(0,0,0,0.8)',
        'glow-sm': '0 0 15px rgba(0,255,65,0.3)',
        'glow-md': '0 0 30px rgba(0,255,65,0.4)',
        'glow-lg': '0 0 60px rgba(0,255,65,0.3)',
      }
    },
  },
  plugins: [],
}
