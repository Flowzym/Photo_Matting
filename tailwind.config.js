/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        checkerA: "#e5e7eb",
        checkerB: "#f3f4f6"
      }
    },
  },
  plugins: [],
}
