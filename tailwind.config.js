/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F2EF',
          100: '#CCE6DF',
          200: '#99CCC0',
          300: '#66B3A0',
          400: '#339980',
          500: '#006B58',
          600: '#005545',
          700: '#004033',
          800: '#002B22',
          900: '#001511',
        },
      },
    },
  },
  plugins: [],
};
