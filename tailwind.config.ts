import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        customBlue: "#2B4690",
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        meshDrift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(30px, -20px, 0) scale(1.05)' },
          '66%': { transform: 'translate3d(-20px, 30px, 0) scale(0.97)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        marquee: 'marquee 32s linear infinite',
        float: 'float 4s ease-in-out infinite',
        blink: 'blink 1s infinite',
        'mesh-drift': 'meshDrift 18s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // …any other plugins you might have
  ],
} satisfies Config;
