/** @type {import('tailwindcss').Config} */
export default {
  important: true,
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens:{
      md: {max: '767px'},
      lg: {max: '1439px'},
    },
    extend: {},
  },
  plugins: [],
};
