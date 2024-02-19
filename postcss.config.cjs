module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
        'postcss-preset-env': {
            preserve: true,
            // https://github.com/csstools/postcss-plugins/blob/main/plugin-packs/postcss-preset-env/FEATURES.md
            features: {
                'oklab-function': true
            }
        }
    }
}
