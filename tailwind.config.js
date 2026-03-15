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
        // Brand palette
        teal: {
          50: '#EEF7F6',
          100: '#D4EBEA',
          200: '#A9D6D4',
          300: '#7EC2BE',
          400: '#4A9B8E',
          500: '#2D6A6A',
          600: '#245858',
          700: '#1B4545',
          800: '#123232',
          900: '#0F1A1A',
        },
        cream: {
          50: '#FDFCF9',
          100: '#FAF8F3',
          200: '#F2EDE3',
          300: '#E8E2D5',
          400: '#D8D0C0',
          500: '#B8B0A0',
        },
        charcoal: {
          50: '#F0EDE8',
          100: '#D8D4CE',
          200: '#B8B4AE',
          300: '#8A8880',
          400: '#5A5855',
          500: '#3A3835',
          600: '#2A2825',
          700: '#1C1C1C',
          800: '#121212',
          900: '#0A0A0A',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        hero: ['clamp(2.8rem, 7vw, 6rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'hero-sm': ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'botanical-float': 'botanicalFloat 8s ease-in-out infinite',
        'leaf-sway': 'leafSway 4s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'marquee-scroll': 'marqueeScroll 40s linear infinite',
      },
      keyframes: {
        botanicalFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-6px) rotate(0.5deg)' },
          '66%': { transform: 'translateY(-3px) rotate(-0.3deg)' },
        },
        leafSway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        marqueeScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        soft: '0 2px 16px rgba(45, 106, 106, 0.08)',
        card: '0 4px 24px rgba(45, 106, 106, 0.10)',
        elevated: '0 8px 40px rgba(45, 106, 106, 0.14)',
        'dark-soft': '0 2px 16px rgba(0, 0, 0, 0.3)',
        'dark-card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        nav: '16px',
      },
    },
  },
  plugins: [],
};
