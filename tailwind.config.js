/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nouveau palette : moins sombre, plus pro et chaleureux
        'cream': {
          50: '#FAFAF8',
          100: '#F5F4F0',
          200: '#E8E6DE',
        },
        'slate': {
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
        },
        'chantier': {
          DEFAULT: '#EA580C',  // orange plus chaleureux
          light: '#FB923C',
          dark: '#C2410C',
          50: '#FFF7ED',
          100: '#FFEDD5',
        },
        'emerald': {
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(15, 23, 42, 0.06)',
        'card': '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.06)',
        'elevated': '0 10px 30px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
}
