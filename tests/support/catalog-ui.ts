import { type Locator, type Page } from '@playwright/test';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function first(page: Page, selectors: string) {
  return page.locator(selectors).first();
}

export function catalogHeading(page: Page) {
  return page.getByRole('heading', { name: /Catalog manager/i }).first();
}

export function pageHeading(page: Page, title: string) {
  return page.getByRole('heading', { name: new RegExp(`^${escapeRegex(title)}$`, 'i') }).first();
}

export function createItemAction(page: Page) {
  return first(page, '[data-testid="create-item"], a:has-text("Create New"), button:has-text("Create New")');
}

export function catalogRows(page: Page) {
  return page.locator('[data-testid="catalog-row"], tbody tr');
}

export function catalogHeader(page: Page) {
  return first(page, '[data-testid="catalog-header"], thead tr');
}

export function nextPageAction(page: Page) {
  return first(page, '[data-testid="pagination-next"], a:has-text("Next"), button:has-text("Next")');
}

export function previousPageAction(page: Page) {
  return first(page, '[data-testid="pagination-previous"], a:has-text("Previous"), button:has-text("Previous")');
}

export function detailsPanel(page: Page) {
  return first(page, '[data-testid="catalog-details"], dl');
}

export function rowByName(page: Page, name: string) {
  return catalogRows(page).filter({ hasText: name }).first();
}

export function rowAction(scope: Locator, action: 'Edit' | 'Details' | 'Delete') {
  const testId = action === 'Details' ? 'view-details' : `${action.toLowerCase()}-item`;
  return scope.locator(`[data-testid="${testId}"], a:has-text("${action}"), button:has-text("${action}")`).first();
}

export function field(page: Page, name: 'name' | 'description' | 'brand' | 'type' | 'price' | 'stock' | 'restock' | 'maxStock') {
  switch (name) {
    case 'name':
      return first(page, '[data-testid="field-name"], input[aria-label="Name"], #MainContent_Name, input[id$="_Name"]:not([readonly])');
    case 'description':
      return first(page, '[data-testid="field-description"], textarea[aria-label="Description"], input[aria-label="Description"], #MainContent_Description');
    case 'brand':
      return first(page, '[data-testid="field-brand"], select[aria-label="Brand"], #MainContent_Brand, #MainContent_BrandDropDownList');
    case 'type':
      return first(page, '[data-testid="field-type"], select[aria-label="Type"], #MainContent_Type, #MainContent_TypeDropDownList');
    case 'price':
      return first(page, '[data-testid="field-price"], input[aria-label="Price"], #MainContent_Price');
    case 'stock':
      return first(page, '[data-testid="field-stock"], input[aria-label="Stock"], #MainContent_Stock');
    case 'restock':
      return first(page, '[data-testid="field-restock"], input[aria-label="Restock"], #MainContent_Restock');
    case 'maxStock':
      return first(page, '[data-testid="field-max-stock"], input[aria-label="Max stock"], #MainContent_Maxstock');
  }
}

export function createButton(page: Page) {
  return first(page, '[data-testid="submit-create"], button:has-text("[ Create ]"), input[type="submit"][value="[ Create ]"]');
}

export function saveButton(page: Page) {
  return first(page, '[data-testid="submit-save"], button:has-text("[ Save ]"), input[type="submit"][value="[ Save ]"]');
}

export function deleteButton(page: Page) {
  return first(page, '[data-testid="submit-delete"], button:has-text("[ Delete ]"), input[type="submit"][value="[ Delete ]"]');
}

export function backToListAction(page: Page) {
  return first(page, '[data-testid="back-to-list"], a:has-text("Back to list"), button:has-text("Back to list")');
}

export function editPageAction(page: Page) {
  return first(page, '[data-testid="edit-item"], a:has-text("Edit"), button:has-text("Edit")');
}
