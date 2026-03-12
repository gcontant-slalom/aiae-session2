const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: [
    {
      command: 'PORT=3030 NODE_ENV=test node packages/backend/src/index.js',
      timeout: 120 * 1000,
      url: 'http://127.0.0.1:3030',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'HOST=127.0.0.1 PORT=3000 BROWSER=none npm run start --workspace=frontend',
      timeout: 120 * 1000,
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: !process.env.CI,
    },
  ],
});