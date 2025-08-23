module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'warn', // Change from 'error' to 'warn'
    'no-unused-vars': 'warn',
    'no-console': 'off', // Allow console.log for debugging
    '@typescript-eslint/no-unused-vars': 'warn'
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  }
};
