import type { Config } from "tailwindcss";
import requireAnimate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Rajdhani'", "'Tajawal'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        arabic: ["'Tajawal'", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "#010208",
        foreground: "#E8EDF5",
        card: {
          DEFAULT: "rgba(8, 12, 28, 0.7)",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#04060D",
          foreground: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#0080FF",
          foreground: "#FFFFFF",
          glow: "rgba(0, 128, 255, 0.6)"
        },
        secondary: {
          DEFAULT: "#8B4FFF",
          foreground: "#FFFFFF",
          glow: "rgba(139, 79, 255, 0.6)"
        },
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.04)",
          foreground: "#8B95A8",
        },
        accent: {
          DEFAULT: "#FF006E",
          foreground: "#FFFFFF",
          glow: "rgba(255, 0, 110, 0.6)"
        },
        destructive: {
          DEFAULT: "#DC143C",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#00FFAA",
          foreground: "#000000",
          glow: "rgba(0, 255, 170, 0.6)"
        },
        warning: {
          DEFAULT: "#FFB800",
          foreground: "#000000",
        },
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.04)",
        ring: "#0080FF",
        sidebar: {
          DEFAULT: "rgba(4, 6, 13, 0.95)",
          foreground: "#E8EDF5",
          border: "rgba(0, 128, 255, 0.15)",
        },
      },
      backgroundImage: {
        'stellar-grid': "linear-gradient(to right, rgba(0, 128, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 128, 255, 0.03) 1px, transparent 1px)",
        'cosmic-gradient': "radial-gradient(circle at 50% 50%, rgba(139, 79, 255, 0.08) 0%, transparent 60%)",
        'energy-pulse': "radial-gradient(circle at center, rgba(0, 128, 255, 0.15) 0%, transparent 70%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "stellar-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 8px rgba(0, 128, 255, 0.4), 0 0 16px rgba(0, 128, 255, 0.2)" 
          },
          "50%": { 
            boxShadow: "0 0 20px rgba(0, 128, 255, 0.6), 0 0 40px rgba(0, 128, 255, 0.3)" 
          },
        },
        "cosmic-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 10px rgba(139, 79, 255, 0.5), 0 0 20px rgba(139, 79, 255, 0.3)" 
          },
          "50%": { 
            boxShadow: "0 0 25px rgba(139, 79, 255, 0.7), 0 0 50px rgba(139, 79, 255, 0.4)" 
          },
        },
        "energy-wave": {
          "0%": { transform: "translateY(-100%)", opacity: "0.3" },
          "100%": { transform: "translateY(200%)", opacity: "0" }
        },
        "plasma-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "stellar-glow": "stellar-glow 3s infinite ease-in-out",
        "cosmic-pulse": "cosmic-pulse 4s infinite ease-in-out",
        "energy-wave": "energy-wave 10s linear infinite",
        "plasma-shimmer": "plasma-shimmer 8s ease infinite",
      },
    },
  },
  plugins: [requireAnimate],
};
