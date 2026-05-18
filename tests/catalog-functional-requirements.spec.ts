import { expect, test, type Locator, type Page } from '@playwright/test';

import { activeAppProfile, defaultPageSize } from './support/app-profile';
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

type CatalogRow = {
  row: Locator;
  editLink: Locator;
  detailsLink: Locator;
  deleteLink: Locator;
};

async function gotoHome(page: Page) {
  await page.goto(activeAppProfile.homePath);
  await expect(catalogHeading(page)).toBeVisible();
}

async function expectOnListPage(page: Page) {
  await expect(page).toHaveURL(activeAppProfile.homeUrl);
}

async function gotoPage(page: Page, index: number) {
  await page.goto(activeAppProfile.pagePath(index, defaultPageSize));
  await expect(page).toHaveURL(activeAppProfile.pageUrl(index, defaultPageSize));
}

async function gotoSecondPage(page: Page) {
  await nextPageAction(page).click();
  await expect(page).toHaveURL(activeAppProfile.pageUrl(1, defaultPageSize));
}

async function getRowByName(page: Page, name: string): Promise<CatalogRow> {
  for (const pageIndex of searchPageIndexes) {
    if (pageIndex === 0) {
      await gotoHome(page);
    } else {
      await gotoPage(page, pageIndex);
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

async function deleteItemIfPresent(page: Page, name: string) {
  for (const pageIndex of searchPageIndexes) {
    if (pageIndex === 0) {
      await gotoHome(page);
    } else {
      await gotoPage(page, pageIndex);
    }

    const row = rowByName(page, name);
    if (await row.count()) {
      await rowAction(row, 'Delete').click();
      await expect(pageHeading(page, 'Delete')).toBeVisible();
      await deleteButton(page).click();
      await expectOnListPage(page);
      return;
    }
  }
}

async function createItem(page: Page, name: string) {
  await gotoHome(page);
  await createItemAction(page).click();

  await expect(pageHeading(page, 'Create')).toBeVisible();
  await field(page, 'name').fill(name);
  await field(page, 'description').fill('Created by Playwright FR coverage');
  await field(page, 'brand').selectOption({ label: 'Azure' });
  await field(page, 'type').selectOption({ label: 'USB Memory Stick' });
  await field(page, 'price').fill('42.10');
  await field(page, 'stock').fill('7');
  await field(page, 'restock').fill('2');
  await field(page, 'maxStock').fill('12');

  await createButton(page).click();
  await expectOnListPage(page);
}

test.describe('Catalog functional requirements', () => {
  test.beforeEach(async ({ page }) => {
    await deleteItemIfPresent(page, createdItemName);
    await deleteItemIfPresent(page, updatedItemName);
  });

  test('FR-1 lists catalog items', async ({ page }) => {
    await gotoHome(page);

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

  test('FR-2 supports route-based pagination', async ({ page }) => {
    await gotoHome(page);

    await expect(nextPageAction(page)).toBeVisible();
    await gotoSecondPage(page);
    await expect(rowByName(page, 'Cup<T> Sheet')).toBeVisible();

    await previousPageAction(page).click();
    await expect(page).toHaveURL(activeAppProfile.pageUrl(0, defaultPageSize));
    await expect(rowByName(page, '.NET Bot Black Hoodie')).toBeVisible();
  });

  test('FR-3 shows item details', async ({ page }) => {
    const hoodieRow = await getRowByName(page, '.NET Bot Black Hoodie');
    await hoodieRow.detailsLink.click();

    await expect(pageHeading(page, 'Details')).toBeVisible();
    await expect(detailsPanel(page)).toContainText('.NET Bot Black Hoodie');
    await expect(detailsPanel(page)).toContainText('.NET');
    await expect(detailsPanel(page)).toContainText('T-Shirt');
    await expect(editPageAction(page)).toBeVisible();
    await backToListAction(page).click();
    await expectOnListPage(page);
  });

  test('FR-4 creates a catalog item', async ({ page }) => {
    await createItem(page, createdItemName);
    const row = await getRowByName(page, createdItemName);

    await expect(row.row).toContainText(createdItemName);
    await expect(row.row).toContainText('Azure');
    await expect(row.row).toContainText('USB Memory Stick');
    await expect(row.row).toContainText('42.10');
    await expect(row.row).toContainText('7');
  });

  test('FR-5 edits a catalog item', async ({ page }) => {
    await createItem(page, createdItemName);
    const row = await getRowByName(page, createdItemName);
    await row.editLink.click();

    await expect(pageHeading(page, 'Edit')).toBeVisible();
    await expect(field(page, 'brand')).toHaveValue('1');
    await expect(field(page, 'type')).toHaveValue('4');

    await field(page, 'name').fill(updatedItemName);
    await field(page, 'description').fill('Updated by Playwright');
    await field(page, 'brand').selectOption({ label: 'Visual Studio' });
    await field(page, 'type').selectOption({ label: 'Mug' });
    await field(page, 'price').fill('55.25');
    await field(page, 'stock').fill('9');
    await field(page, 'restock').fill('3');
    await field(page, 'maxStock').fill('15');
    await saveButton(page).click();

    await expectOnListPage(page);
    const updatedRow = await getRowByName(page, updatedItemName);
    await expect(updatedRow.row).toContainText('Visual Studio');
    await expect(updatedRow.row).toContainText('Mug');
    await expect(updatedRow.row).toContainText('55.25');
    await expect(updatedRow.row).toContainText('9');
  });

  test('FR-6 deletes a catalog item', async ({ page }) => {
    await createItem(page, createdItemName);
    const row = await getRowByName(page, createdItemName);
    await row.deleteLink.click();

    await expect(pageHeading(page, 'Delete')).toBeVisible();
    await expect(detailsPanel(page)).toContainText(createdItemName);
    await deleteButton(page).click();

    await expectOnListPage(page);
    for (const pageIndex of searchPageIndexes) {
      if (pageIndex === 0) {
        await gotoHome(page);
      } else {
        await gotoPage(page, pageIndex);
      }

      await expect(rowByName(page, createdItemName)).toHaveCount(0);
    }
  });

  test('FR-7 shows reference data for brands and types', async ({ page }) => {
    await gotoHome(page);
    await createItemAction(page).click();

    await expect(pageHeading(page, 'Create')).toBeVisible();
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
});
