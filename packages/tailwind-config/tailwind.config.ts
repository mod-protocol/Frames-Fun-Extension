import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  mode: "jit",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./@/**/*.{ts,tsx}",
    "./node_modules/@frames.js/render/dist/**/*.{ts,tsx,js,css}",
    "../../packages/ui/**/*.{ts,tsx,js,css}",
  ],
  plugins: [],
} satisfies Config;

export default config;
