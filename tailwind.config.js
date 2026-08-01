/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', "sans-serif"],
        sans: ['"Outfit"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        bg: {
          DEFAULT: "#09090F",
          deep: "#06060B",
          surface: "#0F1117",
          card: "#13161E",
          elevated: "#181C27",
          border: "#1F2535",
          hover: "#1A2030",
        },
        brand: {
          DEFAULT: "#4F8EF7",
          dark: "#3B7AE8",
          light: "#7AABFF",
          glow: "rgba(79,142,247,0.3)",
          dim: "rgba(79,142,247,0.12)",
        },
        finance: {
          DEFAULT: "#34D399",
          dim: "rgba(52,211,153,0.12)",
          glow: "rgba(52,211,153,0.3)",
        },
        hr: {
          DEFAULT: "#A78BFA",
          dim: "rgba(167,139,250,0.12)",
          glow: "rgba(167,139,250,0.3)",
        },
        inv: {
          DEFAULT: "#FBBF24",
          dim: "rgba(251,191,36,0.12)",
          glow: "rgba(251,191,36,0.3)",
        },
        crm: {
          DEFAULT: "#FB7185",
          dim: "rgba(251,113,133,0.12)",
          glow: "rgba(251,113,133,0.3)",
        },
        admin: {
          DEFAULT: "#22D3EE",
          dim: "rgba(34,211,238,0.12)",
          glow: "rgba(34,211,238,0.3)",
        },
        text: {
          primary: "#EEF2FF",
          secondary: "#8896B3",
          muted: "#4B5675",
          hint: "#2D3650",
        },
        state: {
          success: "#22C55E",
          warning: "#EAB308",
          danger: "#EF4444",
          info: "#3B82F6",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)",
        lift: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,142,247,0.15)",
        "glow-brand": "0 0 20px rgba(79,142,247,0.25)",
        "glow-finance": "0 0 20px rgba(52,211,153,0.25)",
        "glow-hr": "0 0 20px rgba(167,139,250,0.25)",
        "glow-inv": "0 0 20px rgba(251,191,36,0.25)",
        "glow-crm": "0 0 20px rgba(251,113,133,0.25)",
        "inner-top": "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in": {
          from: { transform: "translateX(-16px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.97)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 1.8s infinite linear",
        "spin-slow": "spin-slow 3s linear infinite",
      },
      borderRadius: { xl: "12px", "2xl": "16px", "3xl": "20px" },
    },
  },
  plugins: [],
};
