/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 50: "#f6f7f9", 900: "#0f1115", 950: "#080a0e" },
        accent: { 400: "#7dd3fc", 500: "#38bdf8", 600: "#0284c7" },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
