import { defineConfig, devices } from '@playwright/test';

import { getAppProfile, type AppProfileName } from './tests/support/app-profile';

const selectedProject = getSelectedProject(process.argv) ?? 'angular';
const activeAppProfile = getAppProfile(selectedProject);

function projectConfig(name: AppProfileName) {
  const profile = getAppProfile(name);

  return {
    name,
    use: {
      baseURL: process.env.PLAYWRIGHT_BASE_URL ?? profile.baseURL,
      trace: 'on-first-retry' as const,
      screenshot: 'only-on-failure' as const,
      channel: 'msedge',
      ...devices['Desktop Edge'],
    },
  };
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  projects: [projectConfig('angular'), projectConfig('webforms')],
  webServer: activeAppProfile.webServerCommand
    ? {
        command: activeAppProfile.webServerCommand,
        url: `${process.env.PLAYWRIGHT_BASE_URL ?? activeAppProfile.baseURL}${activeAppProfile.homePath}`,
        reuseExistingServer: true,
        timeout: 240000,
      }
    : undefined,
});

function getSelectedProject(argv: string[]): AppProfileName | undefined {
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (current === '--project') {
      const next = argv[index + 1];
      if (next === 'angular' || next === 'webforms') {
        return next;
      }
    }

    if (current === '--project=angular' || current === '--project=webforms') {
      return current.slice('--project='.length) as AppProfileName;
    }
  }

  return undefined;
}
