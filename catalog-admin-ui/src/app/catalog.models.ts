export type LookupItem = {
  id: number;
  name: string;
};

export type CatalogListItem = {
  id: number;
  name: string;
  description: string;
  brand: string;
  type: string;
  price: number;
  pictureFileName: string;
  availableStock: number;
  restockThreshold: number;
  maxStockThreshold: number;
  pictureUri: string;
};

export type CatalogPage = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: CatalogListItem[];
};

export type CatalogItemDetails = {
  id: number;
  name: string;
  description: string;
  catalogBrandId: number;
  brand: string;
  catalogTypeId: number;
  type: string;
  price: number;
  pictureFileName: string;
  availableStock: number;
  restockThreshold: number;
  maxStockThreshold: number;
  pictureUri: string;
};

export type CatalogItemRequest = {
  name: string;
  description: string;
  catalogBrandId: number;
  catalogTypeId: number;
  price: number;
  availableStock: number;
  restockThreshold: number;
  maxStockThreshold: number;
};

export type ValidationProblem = {
  errors?: Record<string, string[]>;
};
