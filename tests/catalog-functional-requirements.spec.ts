import { expect, test, type Locator, type Page } from '@playwright/test';

const createdItemName = 'Playwright FR Item';
const updatedItemName = 'Playwright FR Item Updated';

type CatalogRow = {
  row: Locator;
  editLink: Locator;
  detailsLink: Locator;
  deleteLink: Locator;
};

async function gotoHome(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /Catalog manager/i })).toBeVisible();
}

async function expectOnListPage(page: Page) {
  await expect(page).toHaveURL(/\/(?:Default(?:\.aspx)?)?$/);
}

async function gotoSecondPage(page: Page) {
  await page.getByRole('link', { name: 'Next' }).click();
  await expect(page).toHaveURL(/\/Default\/index\/1\/size\/10$/);
}

function getCatalogItemIdFromUrl(url: string): string {
  const match = /\/(\d+)$/.exec(url);
  if (!match) {
    throw new Error(`Could not read catalog item id from URL: ${url}`);
  }

  return match[1];
}

async function getRowByName(page: Page, name: string): Promise<CatalogRow> {
  const row = page.locator('tbody tr').filter({ hasText: name }).first();
  await expect(row).toBeVisible();

  return {
    row,
    editLink: row.getByRole('link', { name: 'Edit' }),
    detailsLink: row.getByRole('link', { name: 'Details' }),
    deleteLink: row.getByRole('link', { name: 'Delete' }),
  };
}

async function gotoPage(page: Page, index: number) {
  await page.goto(`/Default/index/${index}/size/10`);
  await expect(page).toHaveURL(new RegExp(`/Default/index/${index}/size/10$`));
}

async function deleteItemIfPresent(page: Page, name: string) {
  await gotoHome(page);

  for (const pageIndex of [0, 1]) {
    const row = page.locator('tbody tr').filter({ hasText: name }).first();
    if (await row.count()) {
      await row.getByRole('link', { name: 'Delete' }).click();
      await expect(page.getByRole('heading', { level: 2, name: 'Delete' })).toBeVisible();
      await page.getByRole('button', { name: '[ Delete ]' }).click();
      await expectOnListPage(page);
      return;
    }

    if (pageIndex === 0) {
      await gotoPage(page, 1);
    }
  }
}

async function createItem(page: Page, name: string) {
  await gotoHome(page);
  await page.getByRole('link', { name: 'Create New' }).click();

  await expect(page.getByRole('heading', { level: 2, name: 'Create' })).toBeVisible();
  await page.locator('#MainContent_Name').fill(name);
  await page.locator('#MainContent_Description').fill('Created by Playwright FR coverage');
  await page.locator('#MainContent_Brand').selectOption({ label: 'Azure' });
  await page.locator('#MainContent_Type').selectOption({ label: 'USB Memory Stick' });
  await page.locator('#MainContent_Price').fill('42.10');
  await page.locator('#MainContent_Stock').fill('7');
  await page.locator('#MainContent_Restock').fill('2');
  await page.locator('#MainContent_Maxstock').fill('12');

  await page.getByRole('button', { name: '[ Create ]' }).click();
  await expectOnListPage(page);
}

async function createAndOpenCreatedItem(page: Page, name: string) {
  await createItem(page, name);
  await gotoSecondPage(page);
  const row = await getRowByName(page, name);
  const createdItemId = getCatalogItemIdFromUrl(await row.editLink.getAttribute('href') ?? '');

  return { row, createdItemId };
}

test.describe('Catalog functional requirements', () => {
  test.beforeEach(async ({ page }) => {
    await deleteItemIfPresent(page, createdItemName);
    await deleteItemIfPresent(page, updatedItemName);
  });

  test('FR-1 lists catalog items', async ({ page }) => {
    await gotoHome(page);

    await expect(page.getByRole('link', { name: 'Create New' })).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(10);
    await expect(page.locator('thead tr')).toContainText('Name');
    await expect(page.locator('thead tr')).toContainText('Brand');
    await expect(page.locator('thead tr')).toContainText('Type');
    await expect(page.locator('thead tr')).toContainText('Price');
    await expect(page.locator('thead tr')).toContainText('Stock');

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toContainText('.NET Bot Black Hoodie');
    await expect(firstRow).toContainText('.NET');
    await expect(firstRow).toContainText('T-Shirt');
  });

  test('FR-2 supports route-based pagination', async ({ page }) => {
    await gotoHome(page);

    await expect(page.getByRole('link', { name: 'Previous' })).toHaveClass(/esh-pager-item--hidden/);
    await expect(page.getByRole('link', { name: 'Next' })).toBeVisible();
    await expect(page.locator('.esh-pager')).toContainText('Showing 10 of 12 products - Page 1 - 2');

    await gotoSecondPage(page);
    await expect(page.locator('.esh-pager')).toContainText('Showing 10 of 12 products - Page 2 - 2');
    await expect(page.locator('tbody tr')).toHaveCount(2);
    await expect(page.locator('tbody tr').first()).toContainText('Cup<T> Sheet');
    await expect(page.getByRole('link', { name: 'Next' })).toHaveClass(/esh-pager-item--hidden/);

    await page.getByRole('link', { name: 'Previous' }).click();
    await expect(page).toHaveURL(/\/Default\/index\/0\/size\/10$/);
  });

  test('FR-3 shows item details', async ({ page }) => {
    await gotoHome(page);

    const hoodieRow = await getRowByName(page, '.NET Bot Black Hoodie');
    await hoodieRow.detailsLink.click();

    await expect(page).toHaveURL(/\/Catalog\/Details\/1$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Details' })).toBeVisible();
    await expect(page.locator('dl')).toContainText('.NET Bot Black Hoodie');
    await expect(page.locator('dl')).toContainText('.NET');
    await expect(page.locator('dl')).toContainText('T-Shirt');
    await expect(page.getByRole('link', { name: 'Edit' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to list' }).click();
    await expectOnListPage(page);
  });

  test('FR-4 creates a catalog item', async ({ page }) => {
    const { row } = await createAndOpenCreatedItem(page, createdItemName);

    await expect(row.row).toContainText(createdItemName);
    await expect(row.row).toContainText('Azure');
    await expect(row.row).toContainText('USB Memory Stick');
    await expect(row.row).toContainText('42.10');
    await expect(row.row).toContainText('7');
  });

  test('FR-5 edits a catalog item', async ({ page }) => {
    const { createdItemId, row } = await createAndOpenCreatedItem(page, createdItemName);
    await row.editLink.click();

    await expect(page).toHaveURL(new RegExp(`/Catalog/Edit/${createdItemId}$`));
    await expect(page.getByRole('heading', { level: 2, name: 'Edit' })).toBeVisible();
    await expect(page.locator('#MainContent_BrandDropDownList')).toHaveValue('1');
    await expect(page.locator('#MainContent_TypeDropDownList')).toHaveValue('4');

    await page.locator('#MainContent_Name').fill(updatedItemName);
    await page.locator('#MainContent_Description').fill('Updated by Playwright');
    await page.locator('#MainContent_BrandDropDownList').selectOption({ label: 'Visual Studio' });
    await page.locator('#MainContent_TypeDropDownList').selectOption({ label: 'Mug' });
    await page.locator('#MainContent_Price').fill('55.25');
    await page.locator('#MainContent_Stock').fill('9');
    await page.locator('#MainContent_Restock').fill('3');
    await page.locator('#MainContent_Maxstock').fill('15');
    await page.getByRole('button', { name: '[ Save ]' }).click();

    await expectOnListPage(page);
    await gotoSecondPage(page);
    const updatedRow = await getRowByName(page, updatedItemName);
    await expect(updatedRow.row).toContainText('Visual Studio');
    await expect(updatedRow.row).toContainText('Mug');
    await expect(updatedRow.row).toContainText('55.25');
    await expect(updatedRow.row).toContainText('9');
  });

  test('FR-6 deletes a catalog item', async ({ page }) => {
    const { createdItemId, row } = await createAndOpenCreatedItem(page, createdItemName);
    await row.deleteLink.click();

    await expect(page).toHaveURL(new RegExp(`/Catalog/Delete/${createdItemId}$`));
    await expect(page.getByRole('heading', { level: 2, name: 'Delete' })).toBeVisible();
    await expect(page.locator('dl')).toContainText(createdItemName);
    await page.getByRole('button', { name: '[ Delete ]' }).click();

    await expectOnListPage(page);
    await gotoPage(page, 1);
    await expect(page.locator('tbody tr').filter({ hasText: createdItemName })).toHaveCount(0);
  });

  test('FR-7 shows reference data for brands and types', async ({ page }) => {
    await gotoHome(page);
    await page.getByRole('link', { name: 'Create New' }).click();

    await expect(page.getByRole('heading', { level: 2, name: 'Create' })).toBeVisible();
    await expect(page.locator('#MainContent_Brand')).toContainText('Azure');
    await expect(page.locator('#MainContent_Brand')).toContainText('.NET');
    await expect(page.locator('#MainContent_Brand')).toContainText('Visual Studio');
    await expect(page.locator('#MainContent_Brand')).toContainText('SQL Server');
    await expect(page.locator('#MainContent_Brand')).toContainText('Other');
    await expect(page.locator('#MainContent_Type')).toContainText('Mug');
    await expect(page.locator('#MainContent_Type')).toContainText('T-Shirt');
    await expect(page.locator('#MainContent_Type')).toContainText('Sheet');
    await expect(page.locator('#MainContent_Type')).toContainText('USB Memory Stick');
  });
});
