import { defineConfig } from 'vitest/config';

export default defineConfig({
  envPrefix: ['VITE_', 'ENVIRONMENT'],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
