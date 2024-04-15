/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens:{
      md: {max: '767px'},
      lg: {max: '1439px'},
    },
    extend: {
      colors: {
        customBlue: "#2196F3",
        customWarning: "#ffc107",
        customGreen: "#4CAF50"
      },
      borderRadius: {
        10: "40px",
      },
      keyframes: {
        arrival:{
          '0%, 100%': {
            transform: 'translateX(200px)'
          },
          '20%, 80%': {
            transform: 'translateX(-256px)'
          }
        }
      }, 
      animation: {
        messageArrival: 'arrival 5s',
      }
    },
  },
  plugins: [],
};
