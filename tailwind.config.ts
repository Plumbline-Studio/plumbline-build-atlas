import type { Config } from "tailwindcss";

/**
 * Mirrors the Plumbline Console token vocabulary (navy/peak/gold/gold-bright/
 * slate + shadcn-style semantic names) so components copy between the two
 * codebases without class rewrites.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--navy-hsl))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--foreground))" },
        navy: "hsl(var(--navy-hsl))",
        peak: "hsl(var(--peak))",
        gold: "hsl(var(--primary))",
        "gold-bright": "hsl(var(--accent))",
        slate: "hsl(var(--muted-foreground))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: { lg: "0.625rem", md: "0.5rem", sm: "0.375rem" },
    },
  },
  plugins: [],
};
export default config;
