/** @type {import('jest').Config} */
const config = {
  verbose: true,
  moduleNameMapper: {
    "^https://esm\\.sh/peerjs@1\\.5\\.2$": "<rootDir>/tests/__mocks__/mock-peerjs.js",
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv : ['<rootDir>/tests/modules/test-setup.js']
};

module.exports = config;