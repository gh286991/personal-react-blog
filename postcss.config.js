const path = require('node:path');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

const tailwindConfigPath = path.resolve(__dirname, 'tailwind.config.js');

module.exports = {
  plugins: [
    tailwindcss({ config: tailwindConfigPath }),
    autoprefixer(),
  ],
};
