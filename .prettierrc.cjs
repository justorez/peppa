module.exports = {
    semi: false,
    singleQuote: true,
    tabWidth: 4,
    useTabs: false,
    trailingComma: 'none',
    singleAttributePerLine: true,
    htmlWhitespaceSensitivity: 'ignore',
    overrides: [
        {
            files: ['*.json', '*.yaml', '*.yml'],
            options: {
                tabWidth: 2
            }
        }
    ]
}
