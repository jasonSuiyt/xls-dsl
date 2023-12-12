/** @type {import('tailwindcss').Config} */
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

