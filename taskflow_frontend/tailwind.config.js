/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      "colors": {
        "surface": "#fbf9f8",
        "on-secondary": "#ffffff",
        "surface-variant": "#e4e2e2",
        "on-tertiary-container": "#f0f0f0",
        "background": "#fbf9f8",
        "surface-dim": "#dbdad9",
        "on-secondary-fixed": "#151c27",
        "inverse-primary": "#b8c3ff",
        "inverse-surface": "#303031",
        "secondary-fixed-dim": "#c0c6d6",
        "on-tertiary-fixed-variant": "#474747",
        "secondary": "#585f6c",
        "tertiary-container": "#6d6d6d",
        "on-primary-fixed": "#001355",
        "surface-container": "#efeded",
        "on-surface": "#1b1c1c",
        "on-surface-variant": "#434656",
        "tertiary-fixed": "#e2e2e2",
        "outline-variant": "#c4c5d9",
        "error": "#ba1a1a",
        "primary-fixed-dim": "#b8c3ff",
        "on-tertiary-fixed": "#1b1b1b",
        "surface-container-highest": "#e4e2e2",
        "surface-tint": "#104af0",
        "on-tertiary": "#ffffff",
        "secondary-container": "#dce2f2",
        "on-secondary-container": "#5e6572",
        "outline": "#747688",
        "on-primary-fixed-variant": "#0035bd",
        "on-primary": "#ffffff",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "primary": "#0040df",
        "inverse-on-surface": "#f2f0f0",
        "on-secondary-fixed-variant": "#404753",
        "surface-container-lowest": "#ffffff",
        "primary-container": "#2d5bff",
        "on-error-container": "#93000a",
        "secondary-fixed": "#dce2f2",
        "on-primary-container": "#efefff",
        "tertiary-fixed-dim": "#c6c6c6",
        "surface-container-high": "#e9e8e7",
        "primary-fixed": "#dde1ff",
        "surface-container-low": "#f5f3f3",
        "surface-bright": "#fbf9f8",
        "on-background": "#1b1c1c",
        "tertiary": "#555555"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "container-max-width": "640px",
        "element-gap": "16px",
        "gutter": "24px",
        "section-gap": "64px",
        "unit": "8px"
      },
      "fontFamily": {
        "display": ["Outfit"],
        "label-bold": ["Outfit"],
        "body-lg": ["Outfit"],
        "headline-md": ["Outfit"],
        "headline-lg": ["Outfit"],
        "body-md": ["Outfit"]
      },
      "fontSize": {
        "display": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "label-bold": ["16px", {"lineHeight": "1.2", "fontWeight": "600"}],
        "body-lg": ["20px", {"lineHeight": "1.5", "fontWeight": "400"}],
        "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}],
        "headline-lg": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}],
        "body-md": ["18px", {"lineHeight": "1.5", "fontWeight": "400"}]
      }
    },
  },
  plugins: [],
};
