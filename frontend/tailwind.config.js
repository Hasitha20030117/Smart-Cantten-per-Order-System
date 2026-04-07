/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        "dark-card": "#232025",
        "dark-border": "#4A3A30",
        "accent-green": "#F3CF76",
        "accent-teal": "#E07B45",
        "accent-warning": "#D89A4B",
        "accent-danger": "#C65E4D",
      },
    },
  },
  plugins: [],
};
