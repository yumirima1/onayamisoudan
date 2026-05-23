import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: {
          background: "#0f1020",
          card: "#181a2f",
          accent: "#8b7cf6",
          text: "#f3f4f6",
          muted: "#9ca3af"
        }
      },
      boxShadow: {
        quiet: "0 18px 60px rgba(0, 0, 0, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
