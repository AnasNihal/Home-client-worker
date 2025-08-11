/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        green: "#1c392e",
        yellow: "#f5d543",
        white: "#ffff",
        light_green:'#EAF4E7',
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
       fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
    animation: {
    marquee: "marquee 15s linear infinite",
  },  
  },
  plugins: [],
}
