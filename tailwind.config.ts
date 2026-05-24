import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: {
          background: "#0d1118",
          card: "#171c24",
          paper: "#202631",
          line: "#303846",
          accent: "#a9b897",
          warm: "#d8c8a0",
          text: "#f5f1e8",
          muted: "#b3bbc5"
        }
      },
      boxShadow: {
        quiet: "0 18px 50px rgba(0, 0, 0, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
