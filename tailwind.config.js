//tailwind.config.js
const  percentageWidth = require('tailwindcss-percentage-width'); // load the plugin
module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode:  false, // or 'media' or 'class'
    theme: {},
    variants: {
       extend: {},
    },
    plugins: [
        percentageWidth, // tell tailwindcss that you want to use it
        //other plugins...
    ],
    
};