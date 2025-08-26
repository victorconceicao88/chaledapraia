/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        signature: ['"Photograph Signature"', 'cursive'],
        brewery: ['"Local Brewery Sans"', 'sans-serif'],
      },
      colors: {
        primary: '#1C57B0',   // Azul escuro do logo
        secondary: '#36A9B5', // Azul claro do logo
      },
    },
  },
  plugins: [],
}
