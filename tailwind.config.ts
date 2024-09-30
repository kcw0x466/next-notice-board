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
        background: "#ffffff",
        foreground: "#333333",
        primary: "#007bff",
        gray: {
          200: "#f8f9fa",
          700: "#495057",
        },
      },
    },
  },
  plugins: [],
};
export default config;
