module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  noStackTrace: true,
  resetMocks: true,
  resetModules: true,
  restoreMocks: true,
  globals: {
    NODE_ENV: 'test',
  },
  testEnvironment: 'jest-environment-jsdom',
  verbose: true, // Set to false to see console log during tests.
}
