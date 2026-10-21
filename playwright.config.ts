import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 40_000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  // No parallelism: each test launches a real Chrome process with the extension.
  // Running tests serially keeps resource usage predictable and avoids port conflicts.
  workers: 1,
});
