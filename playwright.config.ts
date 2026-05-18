import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:54001';
const appPath = 'C:\\Users\\WouterVanRanst\\repos\\ae-eshopmodernizing\\eShopModernizing\\eShopLegacyWebFormsSolution\\src\\eShopLegacyWebForms';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  webServer: {
    command: `"C:\\Program Files\\IIS Express\\iisexpress.exe" /path:"${appPath}" /port:54001`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    channel: 'msedge',
    ...devices['Desktop Edge'],
  },
});
