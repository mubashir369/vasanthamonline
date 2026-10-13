import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          50: "#fdf2f3",
          100: "#fce7e8",
          200: "#fad1d4",
          300: "#f4a8ae",
          400: "#eb737e",
          500: "#dd4352",
          600: "#c82637",
          700: "#a81b2a",
          800: "#8c1926",
          900: "#751924",
          950: "#420910",
        },
        gold: {
          50: "#fbf8eb",
          100: "#f5eecb",
          200: "#ecdc99",
          300: "#e0c45e",
          400: "#d4af37",
          500: "#be9627",
          600: "#a3771e",
          700: "#82571b",
          800: "#6e471d",
          900: "#5c3c1d",
          950: "#35200c",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out forwards",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
