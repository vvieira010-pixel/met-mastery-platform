import { defineConfig } from 'vitest/config';

// Only the API-proxy suites need vitest (they rely on vi.stubGlobal). They are
// named *.vitest.js so the default `node --test "tests/**/*.test.js"` runner
// does not pick them up and fail with ERR_MODULE_NOT_FOUND.
export default defineConfig({
  test: {
    include: ['tests/**/*.vitest.js'],
    environment: 'node',
    restoreMocks: true,
  },
});
