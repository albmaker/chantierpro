/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          900: '#0a1322',
          800: '#0F1B2D',
          700: '#1A2942',
          600: '#243757',
        },
        'chantier': {
          DEFAULT: '#FF6B35',
          light: '#FF8A5C',
          dark: '#E55524',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
