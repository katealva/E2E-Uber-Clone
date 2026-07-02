/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#111111',
          accent: '#276EF1', // Uber-ish blue accent
        },
      },
    },
  },
  plugins: [],
}
