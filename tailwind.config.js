/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF8C00', // Orange
        },
        secondary: {
          DEFAULT: '#FFF8E7', // Off-white/Cream
        }
      },
    },
  },
  plugins: [],
}