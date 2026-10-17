import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2196E8",
          dark: "#176ED1",
          soft: "#8FC6EE",
          surface: "#A7D2F2"
        }
      },
      boxShadow: {
        panel: "0 10px 30px rgba(0, 0, 0, 0.04)"
      }
    }
  },
  plugins: []
};

export default config;
