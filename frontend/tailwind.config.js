/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cool dark-purple neutrals (page bg, surfaces, text) — full ramp.
        ink: {
          50: "#F8F7FC",
          100: "#EEEBF6",
          200: "#D7D0E8",
          300: "#B5AACB",
          400: "#9B92AE",
          500: "#6B6080",
          600: "#473F63",
          700: "#2D2650",
          800: "#1C1838",
          900: "#13102B",
          950: "#0D0A1A",
        },
        // Violet brand ramp.
        violet: {
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        // Alias so existing utility classes (accent-*) keep working.
        accent: {
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
        },
      },
      fontFamily: {
        // The "* Variable" family names come from the @fontsource-variable packages.
        sans: ["Figtree Variable", "Figtree", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Geist Mono Variable", "Geist Mono", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      fontSize: {
        // Fluid display sizes for the hero — tight leading, negative tracking.
        display: ["clamp(2.6rem, 6vw, 4.75rem)", { lineHeight: "1.03", letterSpacing: "-0.03em" }],
        "display-sm": ["clamp(2rem, 4.5vw, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 16px 40px -24px rgba(0,0,0,0.7)",
        elevated: "0 24px 64px -24px rgba(0,0,0,0.75)",
        glow: "0 0 0 1px rgba(139,92,246,0.16), 0 18px 60px -16px rgba(124,58,237,0.55)",
        "glow-sm": "0 10px 30px -12px rgba(124,58,237,0.55)",
      },
      backgroundImage: {
        sheen: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        caret: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        aurora: {
          "0%,100%": { transform: "translateX(-50%) translateY(0) scale(1)" },
          "50%": { transform: "translateX(-50%) translateY(26px) scale(1.08)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-26px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.8s linear infinite",
        caret: "caret 1.1s steps(1,end) infinite",
        aurora: "aurora 16s ease-in-out infinite",
        float: "float 12s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
