/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
 theme: {
    extend: {
  keyframes: {
    slideLeft: {
      "0%": { transform: "translateX(0)" },
      "100%": { transform: "translateX(-100%)" },
    },
  },
  animation: {
    slideLeft: "slideLeft 20s linear infinite",
  },
}
  },
  plugins: [],
}
