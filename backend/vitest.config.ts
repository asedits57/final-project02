import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    hookTimeout: 30000,
    setupFiles: ['./test/setup.ts'],
    include: ['./test/**/*.test.ts'],
    exclude: ['./dist/**'],
  },
})
