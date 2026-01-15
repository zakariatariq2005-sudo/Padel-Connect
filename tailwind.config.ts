import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6", // Electric blue
        secondary: "#22C55E", // Green
        accent: "#60A5FA", // Bright blue
        neutral: "#FFFFFF", // White
        dark: "#0B1220", // Deep navy
        "dark-light": "#1A2332", // Lighter navy
        "dark-lighter": "#2A3441", // Even lighter navy
      },
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "navy-gradient": "linear-gradient(135deg, #0B1220 0%, #1A2332 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
        "primary-gradient": "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
        "secondary-gradient": "linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)",
      },
      boxShadow: {
        "soft": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "card": "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
        "glow": "0 0 20px rgba(59, 130, 246, 0.4)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.4)",
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
