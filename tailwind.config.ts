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
        background: "var(--background)",
        foreground: "var(--foreground)",
        "inspire-deep": "#0F172A",
        "inspire-green": "#10B981",
        "inspire-green-light": "#34D399",
        "inspire-green-deep": "#064E3B",
        "inspire-sky": "#38BDF8",
      },
      fontFamily: {
        sans: ["var(--font-pt-sans)", "sans-serif"],
        serif: ["var(--font-pt-serif)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;