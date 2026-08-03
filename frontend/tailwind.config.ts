import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Video Streaming/OTT Palette — Cinema Dark */
        background: "#000000",
        foreground: "#F8FAFC",
        card: {
          DEFAULT: "#0C0C0D",
          foreground: "#F8FAFC",
        },
        primary: {
          DEFAULT: "#0F0F23",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1E1B4B",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#E11D48",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#181818",
          foreground: "#94A3B8",
        },
        border: "#1E1B4B",
        ring: "#E11D48",
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        /* Extended Cinema Palette */
        void:    "#000000",
        surface: "#0C0C0D",
        raised:  "#161618",
        overlay: "#1E1E22",
        crimson: "#E11D48",
        ember:   "#F59E0B",
        reel:    "#6366F1",
        onyx:    "#27272A",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        quote:   ["Playfair Display", "serif"],
        body:    ["Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "16px",
        md: "10px",
        sm: "6px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "40px",
      },
      keyframes: {
        "blob-drift": {
          "0%, 100%": { transform: "translate(0px, 0px)" },
          "33%": { transform: "translate(30px, -20px)" },
          "66%": { transform: "translate(-20px, 15px)" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-left": {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "blob-drift":  "blob-drift 12s ease-in-out infinite",
        "blob-drift-2": "blob-drift 16s ease-in-out infinite reverse",
        "blob-drift-3": "blob-drift 20s ease-in-out infinite 4s",
        "fade-up":    "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":    "fade-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in":   "scale-in 0.45s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-left": "slide-left 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      boxShadow: {
        "cinema":  "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
        "crimson": "0 0 40px rgba(225,29,72,0.25), 0 8px 24px rgba(0,0,0,0.6)",
        "ember":   "0 0 40px rgba(245,158,11,0.2), 0 8px 24px rgba(0,0,0,0.6)",
        "reel":    "0 0 40px rgba(99,102,241,0.2), 0 8px 24px rgba(0,0,0,0.6)",
        "card":    "0 4px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
        "glow":    "0 0 60px rgba(225,29,72,0.15), 0 0 0 1px rgba(225,29,72,0.2)",
        "inner-border": "inset 0 0 0 1px rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
