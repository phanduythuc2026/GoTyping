import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#09090b", // zinc-950 dark eye-protective background
        surface: {
          DEFAULT: "#121215",
          elevated: "#18181b",
          border: "#27272a",
        },
        typing: {
          pending: "#52525b", // zinc-600 ghost text
          correct: "#34d399", // emerald-400 crisp text
          incorrect: "#fb7185", // rose-400 error highlight
          extra: "#e11d48", // rose-600
          awl: "#fbbf24", // amber-400 academic word highlight
          collocation: "#38bdf8", // sky-400 collocation highlight
          caret: "#818cf8", // indigo-400 smooth caret
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          900: "#312e81",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      transitionTimingFunction: {
        "caret-glide": "cubic-bezier(0.2, 0.9, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
