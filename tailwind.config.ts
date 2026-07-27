import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // Decorative/large-fill only (badge circle, buttons at size) — fail WCAG as text.
        brand: {
          blue: "#2383e2",
          yellow: "#ffc83d",
          coral: "#ff6257",
          green: "#25c266",
        },
        // WCAG AA-safe (4.5:1+ on white) — use for text, thin strokes, small icons.
        "brand-text": {
          blue: "#1b76d0",
          yellow: "#996d00",
          coral: "#eb0f00",
          green: "#1a8646",
        },
      },
    },
  },
  plugins: [],
};

export default config;
