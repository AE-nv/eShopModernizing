export const defaultPageSize = 10;

export type AppProfileName = 'webforms' | 'angular';

export type AppProfile = {
  name: AppProfileName;
  homePath: string;
  homeUrl: RegExp;
  pagePath: (index: number, size?: number) => string;
  pageUrl: (index: number, size?: number) => RegExp;
  webServerCommand?: string;
};

const webFormsAppPath = 'C:\\Users\\WouterVanRanst\\repos\\ae-eshopmodernizing\\eShopModernizing\\eShopLegacyWebFormsSolution\\src\\eShopLegacyWebForms';

const profiles: Record<AppProfileName, AppProfile> = {
  webforms: {
    name: 'webforms',
    homePath: '/',
    homeUrl: /\/(?:Default(?:\.aspx)?)?$/,
    pagePath: (index, size = defaultPageSize) => `/Default/index/${index}/size/${size}`,
    pageUrl: (index, size = defaultPageSize) => new RegExp(`/Default/index/${index}/size/${size}$`),
    webServerCommand: `"C:\\Program Files\\IIS Express\\iisexpress.exe" /path:"${webFormsAppPath}" /port:54001`,
  },
  angular: {
    name: 'angular',
    homePath: '/catalog',
    homeUrl: /\/catalog$/,
    pagePath: (index, size = defaultPageSize) => `/catalog/page/${index}/size/${size}`,
    pageUrl: (index, size = defaultPageSize) => new RegExp(`/catalog/page/${index}/size/${size}$`),
    webServerCommand: 'npm run start:e2e-app',
  },
};

function isAppProfileName(value: string): value is AppProfileName {
  return value === 'webforms' || value === 'angular';
}

const requestedProfile = process.env.PLAYWRIGHT_APP_PROFILE ?? 'angular';

export const activeAppProfile = isAppProfileName(requestedProfile)
  ? profiles[requestedProfile]
  : profiles.webforms;
