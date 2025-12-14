const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilita modo escuro via classe CSS
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta baseada no Grupo Docemel
        primary: {
          DEFAULT: '#003e2a', // Verde Logo
          light: '#005c3e',
          dark: '#002418',
        },
        secondary: {
          DEFAULT: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    }
  },
  plugins: [],
};
