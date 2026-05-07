/** @type {import('jest').Config} */
const config = {
  verbose: true,
  moduleNameMapper: {
    "^https://esm\\.sh/peerjs@1\\.5\\.2$": "<rootDir>/tests/__mocks__/mock-peerjs.js",
    "^@wonbeanie/lightdb$": "<rootDir>/tests/__mocks__/mock-lightdb.js",
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv : ['<rootDir>/tests/lib/test-setup.js']
};

module.exports = config;
