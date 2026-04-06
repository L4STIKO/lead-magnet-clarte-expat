/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#121823',
        accent: '#00d9a3',
        light: '#f2f4f6',
      },
    },
  },
  plugins: [],
}
