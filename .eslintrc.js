module.exports = {
    env: {
        es6: true,
        'react-native/react-native': true,
        amd: true,
        commonjs: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'valtech',
    ],
    parserOptions: {
        ecmaVersion: 2018,
        ecmaFeatures: {
            jsx: true,
        },
        sourceType: 'module',
    },
    plugins: [
        'react',
        'react-native',
    ],
    rules: {
        'react-native/no-unused-styles': 2,
        'react-native/split-platform-components': 2,
        'react-native/no-inline-styles': 2,
        'react-native/no-color-literals': 2,
    },
};
