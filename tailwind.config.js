/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')


module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      keyframes: {
        blinker: {
          '50%': {
            opacity: 0
          }
        }
      }
    },
  },
  plugins: [],
}

