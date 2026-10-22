/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        ink: '#111a17',
        forest: '#123e32',
        mint: '#d8f0e2',
        lime: '#c9f27c',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(18, 62, 50, 0.12)',
      },
    },
  },
  plugins: [],
};
