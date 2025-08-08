export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
        'mobile': { 'max': '767px' },
        'tablet': { 'min': '768px', 'max': '1023px' },
        'desktop': { 'min': '1024px' },
      },
      spacing: {
        'touch': '44px', // Minimum touch target size
        'touch-lg': '48px',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      colors: {
        coral: {
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffc2c2',
          300: '#ff9b9b',
          400: '#ff7070',
          500: '#ff4d4d',
          600: '#ff3333',
          700: '#e60000',
          800: '#b30000',
          900: '#800000',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        // Extended grayscale for dark mode
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          150: '#EBEDF0', // Custom shade
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          850: '#18212F', // Custom shade
          900: '#111827',
          950: '#0A0F18', // Custom shade
        },
        // Retro colors
        retro: {
          purple: '#9D4EDD',
          pink: '#FF3E6D',
          teal: '#00F5D4',
          yellow: '#FFD23F',
          blue: '#3A86FF',
          orange: '#FB5607',
          green: '#38B000',
          black: '#0B090A',
          cream: '#FFFCF2',
          brown: '#6F4518',
          // Additional vibrant colors for day mode
          magenta: '#FF006E',
          cyan: '#8ECAE6',
          lime: '#CCFF00',
        },
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'themeTransition': 'themeTransition 0.5s ease-in-out',
        'scanline': 'scanline 4s linear infinite',
        'blink': 'blink 1s infinite',
        'vhs': 'vhs 15s infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
        'retro-glow': 'retroGlow 2s ease-in-out infinite alternate',
        'data-stream': 'dataStream 3s linear infinite',
        'hologram-flicker': 'hologramFlicker 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        themeTransition: {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        vhs: {
          '0%, 100%': { filter: 'hue-rotate(0deg)' },
          '25%': { filter: 'hue-rotate(90deg)' },
          '50%': { filter: 'hue-rotate(180deg)' },
          '75%': { filter: 'hue-rotate(270deg)' },
        },
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke, box-shadow',
      },
      transitionDuration: {
        '400': '400ms',
      },
      backgroundImage: {
        'retro-grid': 'linear-gradient(to right, rgba(100,100,100,.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,100,100,.1) 1px, transparent 1px)',
        'retro-dots': 'radial-gradient(circle, rgba(0,0,0,.1) 1px, transparent 1px)',
      },
      fontFamily: {
        'retro': ['"Press Start 2P"', 'cursive'],
        'vhs': ['"VT323"', 'monospace'],
      },
    },
  },
}