/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#D2D2F8",
          200: "#A7A7F2",
          300: "#7474DA",
          400: "#4C4CB5",
          500: "#1E1E84",
          600: "#151571",
          700: "#0F0F5F",
          800: "#09094C",
          900: "#05053F",
        },
      },
    },
  },
  plugins: [],
};
