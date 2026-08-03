module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/__tests__/**',
    '!src/config/initDb.js',
    '!src/config/addIndexes.js',
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testTimeout: 10000,
  verbose: true,
};
