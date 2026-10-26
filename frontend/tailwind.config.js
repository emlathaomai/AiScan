/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fresh: {
          light: '#ecfdf5',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        aging: {
          light: '#fffbeb',
          DEFAULT: '#f59e0b',
          dark: '#b45309',
        },
        spoiled: {
          light: '#fff1f2',
          DEFAULT: '#f43f5e',
          dark: '#be123c',
        }
      },
      keyframes: {
        scan: {
          '0%': { top: '0%' },
          '50%': { top: '96%' },
          '100%': { top: '0%' },
        },
        laserGlow: {
          '0%, 100%': { opacity: '0.8', boxShadow: '0 0 15px #10b981' },
          '50%': { opacity: '1', boxShadow: '0 0 25px #34d399' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(6px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        }
      },
      animation: {
        'scanner-sweep': 'scan 2.4s ease-in-out infinite',
        'laser-glow': 'laserGlow 1.5s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'modalIn': 'modalIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
