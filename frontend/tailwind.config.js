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
        }
      },
      animation: {
        'scanner-sweep': 'scan 2.4s ease-in-out infinite',
        'laser-glow': 'laserGlow 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
