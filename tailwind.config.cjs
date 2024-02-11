/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,css,scss,vue,ts,tsx}'],
    theme: {
        extend: {}
    },
    plugins: [
        require('@tailwindcss/typography'),
        // require('@tailwindcss/forms'),
        require('daisyui')
    ],
    daisyui: {
        // https://daisyui.com/docs/themes/
        themes: ['light', 'dark']
    }
}
