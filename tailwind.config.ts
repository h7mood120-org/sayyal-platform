import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07090A",
          900: "#0B0E10",
          850: "#0F1315",
          800: "#14181B",
          750: "#191E22",
          700: "#20262A",
          600: "#2B3237",
          500: "#3A4249",
        },
        mute: {
          400: "#6B757D",
          300: "#8C959C",
          200: "#AAB2B8",
          100: "#D2D8DC",
        },
        brand: {
          50: "#E8FBF4",
          100: "#C6F5E4",
          200: "#8FEACA",
          300: "#57DCAE",
          400: "#2ECB95",
          500: "#12B981",
          600: "#0C9668",
          700: "#0B7552",
          800: "#0A563E",
          900: "#083D2D",
        },
        teal: {
          400: "#3FD3D0",
          500: "#1FB8B5",
        },
        danger: "#F2555A",
        warn: "#E8A33D",
      },
      fontFamily: {
        sans: ["var(--font-arabic)", "system-ui", "sans-serif"],
        num: ["var(--font-arabic)", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.8)",
        glow: "0 0 0 1px rgba(18,185,129,0.18), 0 8px 40px -14px rgba(18,185,129,0.35)",
        lift: "0 18px 50px -20px rgba(0,0,0,0.9)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(-100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s cubic-bezier(.22,.8,.3,1) both",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(.3,.6,.4,1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
