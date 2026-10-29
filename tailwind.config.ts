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
        finance: {
          background: "var(--surface)", foreground: "var(--text-1)",
          card: { DEFAULT: "var(--surface)", foreground: "var(--text-1)" },
          popover: { DEFAULT: "var(--surface)", foreground: "var(--text-1)" },
          primary: { DEFAULT: "var(--text-1)", foreground: "var(--surface)" },
          secondary: { DEFAULT: "var(--neutral-bg)", foreground: "var(--text-1)" },
          muted: { DEFAULT: "var(--raised)", foreground: "var(--text-2)" },
          accent: { DEFAULT: "var(--neutral-bg)", foreground: "var(--text-1)" },
          destructive: { DEFAULT: "var(--expense)", foreground: "var(--expense-text)" },
          border: "var(--border)", input: "var(--border)", ring: "var(--c2)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: { DEFAULT: "hsl(var(--primary) / <alpha-value>)", foreground: "hsl(var(--primary-foreground) / <alpha-value>)" },
        secondary: { DEFAULT: "hsl(var(--secondary) / <alpha-value>)", foreground: "hsl(var(--secondary-foreground) / <alpha-value>)" },
        muted: { DEFAULT: "hsl(var(--muted) / <alpha-value>)", foreground: "hsl(var(--muted-foreground) / <alpha-value>)" },
        accent: { DEFAULT: "hsl(var(--accent) / <alpha-value>)", foreground: "hsl(var(--accent-foreground) / <alpha-value>)" },
        card: { DEFAULT: "hsl(var(--card) / <alpha-value>)", foreground: "hsl(var(--card-foreground) / <alpha-value>)" },
        popover: { DEFAULT: "hsl(var(--popover) / <alpha-value>)", foreground: "hsl(var(--popover-foreground) / <alpha-value>)" },
        destructive: { DEFAULT: "hsl(var(--destructive) / <alpha-value>)", foreground: "hsl(var(--destructive-foreground) / <alpha-value>)" },
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
