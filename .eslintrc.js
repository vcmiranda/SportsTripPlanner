module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'max-len': 0,
    'object-curly-newline': 0,
    'no-unused-expressions': 0,
    'no-loop-func': 0,
    'no-nested-ternary': 0,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
