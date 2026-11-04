/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#17324D',
          dark: '#0f2235',
          light: '#23476b'
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#087F8C',
          700: '#06636e',
          800: '#054b53',
          900: '#04343a',
          DEFAULT: '#087F8C'
        },
        warmwhite: '#FAFBFC',
        palegray: '#E8EEF2',
        neutralgray: '#64748B',
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#087F8C',
          700: '#06636e',
          800: '#054b53',
          900: '#04343a',
          950: '#032024'
        }
      }
    },
  },
  plugins: [],
}
