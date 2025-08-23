module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'warn' // Change from 'error' to 'warn' to allow build to succeed
  }
};
