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

async function deleteItemIfPresent(page: Page, name: string) {
  await gotoHome(page);
  const row = page.locator('tbody tr').filter({ hasText: name }).first();

  if (await row.count()) {
    await row.getByRole('link', { name: 'Delete' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Delete' })).toBeVisible();
    await page.getByRole('button', { name: '[ Delete ]' }).click();
    await expectOnListPage(page);
  }
}

test.describe('Catalog functional requirements', () => {
  test.beforeEach(async ({ page }) => {
    await deleteItemIfPresent(page, createdItemName);
    await deleteItemIfPresent(page, updatedItemName);
  });

  test('covers FR-1, FR-2, FR-3, FR-4, FR-5, FR-6 and FR-7', async ({ page }) => {
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

    await expect(page.getByRole('link', { name: 'Previous' })).toHaveClass(/esh-pager-item--hidden/);
    await expect(page.getByRole('link', { name: 'Next' })).toBeVisible();
    await expect(page.locator('.esh-pager')).toContainText('Showing 10 of 12 products - Page 1 - 2');

    await page.getByRole('link', { name: 'Next' }).click();
    await expect(page).toHaveURL(/\/Default\/index\/1\/size\/10$/);
    await expect(page.locator('.esh-pager')).toContainText('Showing 10 of 12 products - Page 2 - 2');
    await expect(page.locator('tbody tr')).toHaveCount(2);
    await expect(page.locator('tbody tr').first()).toContainText('Cup<T> Sheet');
    await expect(page.getByRole('link', { name: 'Next' })).toHaveClass(/esh-pager-item--hidden/);

    await page.getByRole('link', { name: 'Previous' }).click();
    await expect(page).toHaveURL(/\/Default\/index\/0\/size\/10$/);

    const hoodieRow = await getRowByName(page, '.NET Bot Black Hoodie');
    await hoodieRow.detailsLink.click();
    await expect(page).toHaveURL(/\/Catalog\/Details\/1$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Details' })).toBeVisible();
    await expect(page.locator('dl')).toContainText('.NET Bot Black Hoodie');
    await expect(page.locator('dl')).toContainText('.NET');
    await expect(page.locator('dl')).toContainText('T-Shirt');
    await expect(page.getByRole('link', { name: 'Edit' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to list' }).click();

    await createItem(page, createdItemName);
    await gotoSecondPage(page);

    const createdRow = await getRowByName(page, createdItemName);
    await expect(createdRow.row).toContainText('Azure');
    await expect(createdRow.row).toContainText('USB Memory Stick');
    await expect(createdRow.row).toContainText('42.10');
    await expect(createdRow.row).toContainText('7');
    const createdItemId = getCatalogItemIdFromUrl(await createdRow.editLink.getAttribute('href') ?? '');

    await createdRow.editLink.click();
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

    await updatedRow.deleteLink.click();
    await expect(page).toHaveURL(new RegExp(`/Catalog/Delete/${createdItemId}$`));
    await expect(page.getByRole('heading', { level: 2, name: 'Delete' })).toBeVisible();
    await expect(page.locator('dl')).toContainText(updatedItemName);
    await page.getByRole('button', { name: '[ Delete ]' }).click();

    await expectOnListPage(page);
    await expect(page.locator('tbody tr').filter({ hasText: updatedItemName })).toHaveCount(0);
  });
});
