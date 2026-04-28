import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    setupFiles: ['./test/setup/vitest.setup.ts'],
    include: ['./test/**/*.spec.{ts,tsx}', './test/**/*.test.{ts,tsx}'],
    exclude: ['./node_modules/**', './lib/**', './esm/**'],
  },
})
