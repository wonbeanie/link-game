/** @type {import('jest').Config} */
const config = {
  verbose: true,
  moduleNameMapper: {
    "^https://esm\\.sh/@wonbeanie/lightdb@2\\.0\\.0$": "<rootDir>/tests/__mocks__/mock-lightdb.js"
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv : ['<rootDir>/tests/lib/test-setup.js']
};

module.exports = config;
