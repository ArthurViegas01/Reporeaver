/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cool dark-purple neutrals (page bg, surfaces, text)
        ink: {
          50:  "#F8F7FC",
          400: "#9B92AE",
          500: "#6B6080",
          700: "#2D2650",
          800: "#1C1838",
          900: "#13102B",
          950: "#0D0A1A",
        },
        // Violet brand ramp
        violet: {
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
        },
        // Alias so existing utility classes (accent-*) keep working
        accent: {
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
        },
      },
      fontFamily: {
        mono: ["Geist Mono", "ui-monospace", "SF Mono", "Menlo", "monospace"],
        sans: ["Figtree", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
