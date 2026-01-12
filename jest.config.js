/** @type {import('jest').Config} */
const config = {
  verbose: true,
  moduleNameMapper: {
    "^https://www\\.gstatic\\.com/firebasejs/12\\.7\\.0/firebase-app\\.js$": "<rootDir>/__mocks__/mock-firebase-app.js",
    "^https://www\\.gstatic\\.com/firebasejs/12\\.7\\.0/firebase-database\\.js$": "<rootDir>/__mocks__/mock-firebase-database.js"
  }
};

module.exports = config;