import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        paper: "#f7f8fb",
        mint: "#4fb49a",
        coral: "#e86f5c",
        amber: "#f5b84b"
      }
    }
  },
  plugins: [typography]
};

export default config;

