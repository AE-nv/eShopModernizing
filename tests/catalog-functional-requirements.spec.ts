import { expect, test as base, type APIResponse, type Locator, type Page } from '@playwright/test';

import { defaultPageSize, getAppProfile, type AppProfileName } from './support/app-profile';
import {
  backToListAction,
  catalogHeader,
  catalogHeading,
  createButton,
  createItemAction,
  deleteButton,
  detailsPanel,
  editPageAction,
  field,
  nextPageAction,
  pageHeading,
  previousPageAction,
  rowAction,
  rowByName,
  saveButton,
} from './support/catalog-ui';

const createdItemName = 'Playwright FR Item';
const updatedItemName = 'Playwright FR Item Updated';
const searchPageIndexes = [0, 1, 2];
const demoDelayMs = getDemoDelayMs();

const test = base.extend<{ appProfile: ReturnType<typeof getAppProfile> }>({
  appProfile: async ({}, use, testInfo) => {
    await use(getAppProfile(testInfo.project.name as AppProfileName));
  },
});

type CatalogRow = {
  row: Locator;
  editLink: Locator;
  detailsLink: Locator;
  deleteLink: Locator;
};

function getDemoDelayMs() {
  const configured = process.env.PLAYWRIGHT_DEMO_DELAY_MS;
  if (!configured) {
    return 0;
  }

  const parsed = Number.parseInt(configured, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

async function waitForDemo(page: Page) {
  if (demoDelayMs > 0) {
    await page.waitForTimeout(demoDelayMs);
  }
}

async function gotoWithDemo(page: Page, url: string) {
  await waitForDemo(page);
  await page.goto(url);
}

async function clickWithDemo(page: Page, locator: Locator) {
  await waitForDemo(page);
  await locator.click();
}

async function fillWithDemo(page: Page, locator: Locator, value: string) {
  await waitForDemo(page);
  await locator.fill(value);
}

async function selectWithDemo(page: Page, locator: Locator, option: { label: string }) {
  await waitForDemo(page);
  await locator.selectOption(option);
}

async function gotoHome(page: Page, appProfile: ReturnType<typeof getAppProfile>) {
  await gotoWithDemo(page, appProfile.homePath);
  await expect(catalogHeading(page)).toBeVisible();
}

async function expectOnListPage(page: Page, appProfile: ReturnType<typeof getAppProfile>) {
  await expect(page).toHaveURL(appProfile.homeUrl);
}

async function gotoPage(page: Page, appProfile: ReturnType<typeof getAppProfile>, index: number) {
  await gotoWithDemo(page, appProfile.pagePath(index, defaultPageSize));
  await expect(page).toHaveURL(appProfile.pageUrl(index, defaultPageSize));
}

async function gotoSecondPage(page: Page, appProfile: ReturnType<typeof getAppProfile>) {
  await clickWithDemo(page, nextPageAction(page));
  await expect(page).toHaveURL(appProfile.pageUrl(1, defaultPageSize));
}

async function getRowByName(page: Page, appProfile: ReturnType<typeof getAppProfile>, name: string): Promise<CatalogRow> {
  for (const pageIndex of searchPageIndexes) {
    if (pageIndex === 0) {
      await gotoHome(page, appProfile);
    } else {
      await gotoPage(page, appProfile, pageIndex);
    }

    const row = rowByName(page, name);
    if (await row.count()) {
      await expect(row).toBeVisible();
      return {
        row,
        editLink: rowAction(row, 'Edit'),
        detailsLink: rowAction(row, 'Details'),
        deleteLink: rowAction(row, 'Delete'),
      };
    }
  }

  throw new Error(`Could not find catalog row for ${name}`);
}

async function deleteItemIfPresent(page: Page, appProfile: ReturnType<typeof getAppProfile>, name: string) {
  for (const pageIndex of searchPageIndexes) {
    if (pageIndex === 0) {
      await gotoHome(page, appProfile);
    } else {
      await gotoPage(page, appProfile, pageIndex);
    }

      const row = rowByName(page, name);
      if (await row.count()) {
        await clickWithDemo(page, rowAction(row, 'Delete'));
        await expect(pageHeading(page, 'Delete')).toBeVisible();
        await clickWithDemo(page, deleteButton(page));
        await expectOnListPage(page, appProfile);
        return;
      }
  }
}

async function createItem(page: Page, appProfile: ReturnType<typeof getAppProfile>, name: string) {
  await gotoHome(page, appProfile);
  await clickWithDemo(page, createItemAction(page));

  await expect(pageHeading(page, 'Create')).toBeVisible();
  await fillWithDemo(page, field(page, 'name'), name);
  await fillWithDemo(page, field(page, 'description'), 'Created by Playwright FR coverage');
  await selectWithDemo(page, field(page, 'brand'), { label: 'Azure' });
  await selectWithDemo(page, field(page, 'type'), { label: 'USB Memory Stick' });
  await fillWithDemo(page, field(page, 'price'), '42.10');
  await fillWithDemo(page, field(page, 'stock'), '7');
  await fillWithDemo(page, field(page, 'restock'), '2');
  await fillWithDemo(page, field(page, 'maxStock'), '12');

  await clickWithDemo(page, createButton(page));
  await expectOnListPage(page, appProfile);
}

async function openCreateForm(page: Page, appProfile: ReturnType<typeof getAppProfile>) {
  await gotoHome(page, appProfile);
  await clickWithDemo(page, createItemAction(page));
  await expect(pageHeading(page, 'Create')).toBeVisible();
}

async function expectValidationError(response: APIResponse, fieldName: string) {
  expect(response.status()).toBe(400);
  const problem = await response.json() as { errors?: Record<string, string[]> };
  expect(problem.errors?.[fieldName]?.length).toBeGreaterThan(0);
}

async function expectInvalidPriceAndStockMessages(page: Page, appProfile: ReturnType<typeof getAppProfile>) {
  if (appProfile.name === 'angular') {
    await expect(page.getByText('The field Price must be a positive number with maximum two decimals.')).toBeVisible();
    await expect(page.getByText('The value must be a non-negative integer.')).toBeVisible();
    return;
  }

  await expect(page.getByText(/The Price must be a positive number with maximum two decimals/i)).toBeVisible();
  await expect(page.getByText(/The field Stock must be between 0 and 10 million/i)).toBeVisible();
}

async function expectMissingRequiredMessages(page: Page, appProfile: ReturnType<typeof getAppProfile>) {
  if (appProfile.name === 'angular') {
    await expect(page.getByText('This field is required.').first()).toBeVisible();
    return;
  }

  await expect(page.getByText('The Name field is required.')).toBeVisible();
}

test.describe('Catalog functional requirements', () => {
  test.beforeEach(async ({ page, appProfile }) => {
    await deleteItemIfPresent(page, appProfile, createdItemName);
    await deleteItemIfPresent(page, appProfile, updatedItemName);
  });

  test('FR-1 lists catalog items', async ({ page, appProfile }) => {
    await gotoHome(page, appProfile);

    await expect(createItemAction(page)).toBeVisible();
    await expect(rowByName(page, '.NET Bot Black Hoodie')).toBeVisible();
    await expect(catalogHeader(page)).toContainText('Name');
    await expect(catalogHeader(page)).toContainText('Brand');
    await expect(catalogHeader(page)).toContainText('Type');
    await expect(catalogHeader(page)).toContainText('Price');
    await expect(catalogHeader(page)).toContainText('Stock');

    const firstItem = rowByName(page, '.NET Bot Black Hoodie');
    await expect(firstItem).toContainText('.NET');
    await expect(firstItem).toContainText('T-Shirt');
  });

  test('FR-2 supports route-based pagination', async ({ page, appProfile }) => {
    await gotoHome(page, appProfile);

    await expect(nextPageAction(page)).toBeVisible();
    await gotoSecondPage(page, appProfile);
    await expect(rowByName(page, 'Cup<T> Sheet')).toBeVisible();

    await clickWithDemo(page, previousPageAction(page));
    await expect(page).toHaveURL(appProfile.pageUrl(0, defaultPageSize));
    await expect(rowByName(page, '.NET Bot Black Hoodie')).toBeVisible();
  });

  test('FR-3 shows item details', async ({ page, appProfile }) => {
    const hoodieRow = await getRowByName(page, appProfile, '.NET Bot Black Hoodie');
    await clickWithDemo(page, hoodieRow.detailsLink);

    await expect(pageHeading(page, 'Details')).toBeVisible();
    await expect(detailsPanel(page)).toContainText('.NET Bot Black Hoodie');
    await expect(detailsPanel(page)).toContainText('.NET');
    await expect(detailsPanel(page)).toContainText('T-Shirt');
    await expect(editPageAction(page)).toBeVisible();
    await clickWithDemo(page, backToListAction(page));
    await expectOnListPage(page, appProfile);
  });

  test('FR-4 creates a catalog item', async ({ page, appProfile }) => {
    await createItem(page, appProfile, createdItemName);
    const row = await getRowByName(page, appProfile, createdItemName);

    await expect(row.row).toContainText(createdItemName);
    await expect(row.row).toContainText('Azure');
    await expect(row.row).toContainText('USB Memory Stick');
    await expect(row.row).toContainText('42.10');
    await expect(row.row).toContainText('7');
  });

  test('FR-5 edits a catalog item', async ({ page, appProfile }) => {
    await createItem(page, appProfile, createdItemName);
    const row = await getRowByName(page, appProfile, createdItemName);
    await clickWithDemo(page, row.editLink);

    await expect(pageHeading(page, 'Edit')).toBeVisible();
    await expect(field(page, 'brand')).toHaveValue('1');
    await expect(field(page, 'type')).toHaveValue('4');

    await fillWithDemo(page, field(page, 'name'), updatedItemName);
    await fillWithDemo(page, field(page, 'description'), 'Updated by Playwright');
    await selectWithDemo(page, field(page, 'brand'), { label: 'Visual Studio' });
    await selectWithDemo(page, field(page, 'type'), { label: 'Mug' });
    await fillWithDemo(page, field(page, 'price'), '55.25');
    await fillWithDemo(page, field(page, 'stock'), '9');
    await fillWithDemo(page, field(page, 'restock'), '3');
    await fillWithDemo(page, field(page, 'maxStock'), '15');
    await clickWithDemo(page, saveButton(page));

    await expectOnListPage(page, appProfile);
    const updatedRow = await getRowByName(page, appProfile, updatedItemName);
    await expect(updatedRow.row).toContainText('Visual Studio');
    await expect(updatedRow.row).toContainText('Mug');
    await expect(updatedRow.row).toContainText('55.25');
    await expect(updatedRow.row).toContainText('9');
  });

  test('FR-6 deletes a catalog item', async ({ page, appProfile }) => {
    await createItem(page, appProfile, createdItemName);
    const row = await getRowByName(page, appProfile, createdItemName);
    await clickWithDemo(page, row.deleteLink);

    await expect(pageHeading(page, 'Delete')).toBeVisible();
    await expect(detailsPanel(page)).toContainText(createdItemName);
    await clickWithDemo(page, deleteButton(page));

    await expectOnListPage(page, appProfile);
    for (const pageIndex of searchPageIndexes) {
      if (pageIndex === 0) {
        await gotoHome(page, appProfile);
      } else {
        await gotoPage(page, appProfile, pageIndex);
      }

      await expect(rowByName(page, createdItemName)).toHaveCount(0);
    }
  });

  test('FR-7 shows reference data for brands and types', async ({ page, appProfile }) => {
    await openCreateForm(page, appProfile);
    await expect(field(page, 'brand')).toContainText('Azure');
    await expect(field(page, 'brand')).toContainText('.NET');
    await expect(field(page, 'brand')).toContainText('Visual Studio');
    await expect(field(page, 'brand')).toContainText('SQL Server');
    await expect(field(page, 'brand')).toContainText('Other');
    await expect(field(page, 'type')).toContainText('Mug');
    await expect(field(page, 'type')).toContainText('T-Shirt');
    await expect(field(page, 'type')).toContainText('Sheet');
    await expect(field(page, 'type')).toContainText('USB Memory Stick');
  });

  test('DV-1 and DV-2 reject invalid price and stock input', async ({ page, request, appProfile }) => {
    if (appProfile.name === 'angular') {
      const invalidPriceResponse = await request.post('/api/catalog-items', {
        data: {
          name: 'Invalid Price Item',
          description: 'Invalid price',
          catalogBrandId: 1,
          catalogTypeId: 4,
          price: 12.345,
          availableStock: 1,
          restockThreshold: 0,
          maxStockThreshold: 2,
        },
      });

      await expectValidationError(invalidPriceResponse, 'Price');
    }

    await openCreateForm(page, appProfile);
    await fillWithDemo(page, field(page, 'name'), 'Invalid UI Item');
    await selectWithDemo(page, field(page, 'brand'), { label: 'Azure' });
    await selectWithDemo(page, field(page, 'type'), { label: 'USB Memory Stick' });
    await fillWithDemo(page, field(page, 'price'), '-1');
    await fillWithDemo(page, field(page, 'stock'), '-1');
    await fillWithDemo(page, field(page, 'restock'), '0');
    await fillWithDemo(page, field(page, 'maxStock'), '1');
    await clickWithDemo(page, createButton(page));

    await expect(pageHeading(page, 'Create')).toBeVisible();
    await expect(page).toHaveURL(/\/Catalog\/Create$/);
    await expectInvalidPriceAndStockMessages(page, appProfile);
  });

  test('DV-3 rejects missing required input', async ({ page, request, appProfile }) => {
    if (appProfile.name === 'angular') {
      const missingRequiredResponse = await request.post('/api/catalog-items', {
        data: {
          name: '',
          description: 'Missing required fields',
          catalogBrandId: 0,
          catalogTypeId: 0,
          price: 12.1,
          availableStock: 1,
          restockThreshold: 0,
          maxStockThreshold: 2,
        },
      });

      await expectValidationError(missingRequiredResponse, 'Name');
      await expectValidationError(missingRequiredResponse, 'CatalogBrandId');
      await expectValidationError(missingRequiredResponse, 'CatalogTypeId');
    }

    await openCreateForm(page, appProfile);
    await clickWithDemo(page, createButton(page));

    await expect(pageHeading(page, 'Create')).toBeVisible();
    await expect(page).toHaveURL(/\/Catalog\/Create$/);
    await expectMissingRequiredMessages(page, appProfile);
    await expect(field(page, 'name')).toBeVisible();
    await expect(field(page, 'brand')).toBeVisible();
    await expect(field(page, 'type')).toBeVisible();
  });
});
