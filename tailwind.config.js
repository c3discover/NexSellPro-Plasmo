/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,html}"],
  darkMode: "media", // Enable dark mode based on user preference
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'Arial', 'sans-serif'], // Inter as primary, Arial as fallback
      },
      fontSize: {
        '2xs': '0.625rem', // You can adjust this value as needed
        '3xs': '0.5rem', // Add a new size for very small text
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Helpful for consistent text styling
    require('@tailwindcss/forms') // Styles forms consistently
  ],
}
