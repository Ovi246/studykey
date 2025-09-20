/** @type {import('tailwindcss').Config} */

module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'comic': ['"Comic Sans MS Bold"'],
        'comic-bold': ['"Comic Sans MS Bold"'],
        'comic-sans': ['"Comic Sans MS Bold"'],
        sans: ['"Comic Sans MS Bold"'],
      }
    },
  },
  plugins: [],
}