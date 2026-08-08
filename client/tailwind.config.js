/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zoom-dark': '#232333',
        'zoom-darker': '#1a1a2e',
        'zoom-blue': '#0b5cff',
        'zoom-blue-hover': '#0043cc',
        'zoom-green': '#2ecc71',
        'zoom-red': '#e74c3c',
      }
    },
  },
  plugins: [],
}
