import type { Config } from "tailwindcss";
const config: Config = {
content: ["./src/**/*.{ts,tsx}"],
theme: {
extend: {
colors: {
ink: {
DEFAULT: "#0B1F33",
900: "#0B1F33",
800: "#15304B",
700: "#23425F",
},
canvas: "#F5F7FA",
line: "#E3E8EF",
mute: {
100: "#1E2B3A",
200: "#344256",
300: "#4A5668",
400: "#667085",
500: "#8A94A6",
600: "#B3BBC7",
},
brand: {
50: "#ECFBF4",
100: "#D3F5E5",
200: "#A6EBCC",
300: "#62D6AA",
400: "#22C08A",
500: "#10B77F",
600: "#0A966A",
700: "#087A56",
800: "#0A5E44",
900: "#0B4A37",
},
navy: {
300: "#4F7FB5",
400: "#1F5A96",
500: "#194B80",
},
danger: "#D92D20",
warn: "#B54708",
},
fontFamily: {
sans: ["var(--font-arabic)", "system-ui", "sans-serif"],
num: ["var(--font-arabic)", "ui-sans-serif", "system-ui"],
},
borderRadius: {
xl: "10px",
"2xl": "12px",
"3xl": "16px",
},
boxShadow: {
card: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
lift: "0 16px 40px -12px rgba(16, 24, 40, 0.18), 0 2px 6px -2px rgba(16, 24, 40, 0.06)",
},
keyframes: {
"fade-in": {
"0%": { opacity: "0" },
"100%": { opacity: "1" },
},
"pulse-ring": {
"0%": { transform: "scale(0.9)", opacity: "0.6" },
"70%": { transform: "scale(1.5)", opacity: "0" },
"100%": { opacity: "0" },
},
},
animation: {
"fade-in": "fade-in .15s ease-out both",
"pulse-ring": "pulse-ring 1.8s cubic-bezier(.3,.6,.4,1) infinite",
},
},
},
plugins: [],
};
export default config;
