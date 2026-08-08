/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#4F46E5",
        "primary-container": "#4338CA",
        "on-primary": "#FFFFFF",
        "secondary": "#F59E0B",
        "secondary-container": "#D97706",
        "on-secondary": "#FFFFFF",
        "background": "#F8FAFC",
        "surface": "#FFFFFF",
        "surface-container-low": "#F1F5F9",
        "surface-container-high": "#E2E8F0",
        "surface-dark": "#0F172A",
        "surface-dark-card": "#1E293B",
        "on-surface": "#0F172A",
        "on-surface-variant": "#64748B",
        "outline-variant": "#E2E8F0",
        "outline": "#94A3B8",
        "error": "#EF4444",
        "success": "#10B981"
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "16px",
        "stack-lg": "24px",
        "stack-sm": "8px",
        "container-margin": "20px",
        "stack-md": "16px"
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"],
        "display": ["Quicksand", "Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
