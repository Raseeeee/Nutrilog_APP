/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        serif: ["'DM Serif Display'", "serif"],
      },
      colors: {
        brand: {
          50:  "#EAF3DE",
          100: "#C0DD97",
          400: "#639922",
          600: "#3B6D11",
          800: "#27500A",
        },
      },
    },
  },
  plugins: [],
}
