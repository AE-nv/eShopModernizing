import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CatalogItemDetails, CatalogItemRequest, CatalogPage, LookupItem } from './catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);

  getCatalogPage(pageIndex: number, pageSize: number) {
    return this.http.get<CatalogPage>('/api/catalog-items', {
      params: {
        pageIndex,
        pageSize,
      },
    });
  }

  getCatalogItem(id: number) {
    return this.http.get<CatalogItemDetails>(`/api/catalog-items/${id}`);
  }

  createCatalogItem(request: CatalogItemRequest) {
    return this.http.post<CatalogItemDetails>('/api/catalog-items', request);
  }

  updateCatalogItem(id: number, request: CatalogItemRequest) {
    return this.http.put<CatalogItemDetails>(`/api/catalog-items/${id}`, request);
  }

  deleteCatalogItem(id: number) {
    return this.http.delete<void>(`/api/catalog-items/${id}`);
  }

  getCatalogBrands() {
    return this.http.get<LookupItem[]>('/api/catalog-brands');
  }

  getCatalogTypes() {
    return this.http.get<LookupItem[]>('/api/catalog-types');
  }
}
