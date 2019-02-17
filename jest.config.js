const path = require('path')

module.exports = {
  clearMocks: true,
  noStackTrace: true,
  resetMocks: true,
  resetModules: true,
  restoreMocks: true,
  globals: {
    'NODE_ENV': 'test',
  },
  setupFilesAfterEnv: [path.join('<rootDir>', 'test-setup.js')],
  testEnvironment: 'node',
  verbose: true, // Set to false to see console log during tests.
}
