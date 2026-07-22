/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "secondary-fixed-dim": "#ffba38",
        "secondary": "#7e5700",
        "on-tertiary": "#ffffff",
        "on-tertiary-fixed": "#1b1c17",
        "on-error-container": "#93000a",
        "error": "#ba1a1a",
        "surface-container-high": "#eae8e7",
        "surface-dim": "#dcd9d9",
        "on-secondary-fixed-variant": "#604100",
        "primary": "#000666",
        "on-tertiary-fixed-variant": "#474742",
        "on-background": "#1b1c1c",
        "surface-container-low": "#f5f3f3",
        "background": "#fbf9f8",
        "on-primary-fixed": "#000767",
        "surface-variant": "#e4e2e1",
        "primary-container": "#1a237e",
        "on-secondary-fixed": "#281900",
        "outline-variant": "#c6c5d4",
        "inverse-surface": "#303030",
        "inverse-on-surface": "#f2f0f0",
        "on-secondary-container": "#6a4800",
        "on-primary": "#ffffff",
        "on-primary-container": "#8690ee",
        "surface-tint": "#4c56af",
        "primary-fixed": "#e0e0ff",
        "surface-bright": "#fbf9f8",
        "secondary-container": "#feb300",
        "primary-fixed-dim": "#bdc2ff",
        "outline": "#767683",
        "error-container": "#ffdad6",
        "surface": "#fbf9f8",
        "surface-container-highest": "#e4e2e1",
        "on-tertiary-container": "#989891",
        "on-surface": "#1b1c1c",
        "on-primary-fixed-variant": "#343d96",
        "tertiary-fixed-dim": "#c8c7bf",
        "surface-container": "#f0eded",
        "surface-container-lowest": "#ffffff",
        "on-secondary": "#ffffff",
        "tertiary-container": "#30302b",
        "tertiary-fixed": "#e4e3db",
        "on-surface-variant": "#454652",
        "on-error": "#ffffff",
        "inverse-primary": "#bdc2ff",
        "secondary-fixed": "#ffdeac",
        "tertiary": "#1b1b17"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
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
        "display-lg-mobile": ["Quicksand"],
        "body-lg": ["Inter"],
        "display-lg": ["Quicksand"],
        "headline-md": ["Quicksand"],
        "body-md": ["Inter"],
        "title-lg": ["Quicksand"],
        "label-md": ["Inter"]
      },
      fontSize: {
        "display-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "display-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "title-lg": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
