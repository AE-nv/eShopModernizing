import { defineConfig, devices } from '@playwright/test';

import { activeAppProfile } from './tests/support/app-profile';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:54001';
const webServerCommand = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? activeAppProfile.webServerCommand;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  webServer: webServerCommand
    ? {
        command: webServerCommand,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120000,
      }
    : undefined,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    channel: 'msedge',
    ...devices['Desktop Edge'],
  },
});
