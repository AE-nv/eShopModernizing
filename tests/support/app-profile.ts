export const defaultPageSize = 10;

export type AppProfileName = 'webforms' | 'angular';

export type AppProfile = {
  name: AppProfileName;
  baseURL: string;
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
    baseURL: 'http://localhost:50586',
    homePath: '/',
    homeUrl: /\/(?:Default(?:\.aspx)?)?$/,
    pagePath: (index, size = defaultPageSize) => `/Default/index/${index}/size/${size}`,
    pageUrl: (index, size = defaultPageSize) => new RegExp(`/Default/index/${index}/size/${size}$`),
  },
  angular: {
    name: 'angular',
    baseURL: 'http://localhost:54001',
    homePath: '/catalog',
    homeUrl: /\/catalog$/,
    pagePath: (index, size = defaultPageSize) => `/catalog/page/${index}/size/${size}`,
    pageUrl: (index, size = defaultPageSize) => new RegExp(`/catalog/page/${index}/size/${size}$`),
  },
};

export function getAppProfile(name: AppProfileName) {
  return profiles[name];
}
