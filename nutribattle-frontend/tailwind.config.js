// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind where to look for classes to include in the CSS
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // We can add custom colors for our Nepali food theme
      colors: {
        'nepali-red': '#DC143C',
        'nepali-blue': '#003893',
      }
    },
  },
  plugins: [],
}