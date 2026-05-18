import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogApiService } from './catalog-api.service';
import { CatalogPage } from './catalog.models';

@Component({
  selector: 'app-catalog-list-page',
  imports: [CommonModule, RouterLink, DecimalPipe],
  template: `
    <section class="page-card">
      <div class="page-actions">
        <a class="esh-link-item" data-testid="create-item" routerLink="/Catalog/Create">Create New</a>
      </div>

      @if (page; as currentPage) {
        <table>
          <thead>
            <tr data-testid="catalog-header">
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Brand</th>
              <th>Type</th>
              <th>Price</th>
              <th>Picture name</th>
              <th>Stock</th>
              <th>Restock</th>
              <th>Max stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (item of currentPage.items; track item.id) {
              <tr data-testid="catalog-row">
                <td><img class="catalog-picture" [src]="item.pictureUri" [alt]="item.name" /></td>
                <td>{{ item.name }}</td>
                <td>{{ item.description }}</td>
                <td>{{ item.brand }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.price | number: '1.2-2' }}</td>
                <td>{{ item.pictureFileName }}</td>
                <td>{{ item.availableStock }}</td>
                <td>{{ item.restockThreshold }}</td>
                <td>{{ item.maxStockThreshold }}</td>
                <td>
                  <a class="esh-table-link" data-testid="edit-item" [routerLink]="['/Catalog/Edit', item.id]">Edit</a>
                  |
                  <a class="esh-table-link" data-testid="view-details" [routerLink]="['/Catalog/Details', item.id]">Details</a>
                  |
                  <a class="esh-table-link" data-testid="delete-item" [routerLink]="['/Catalog/Delete', item.id]">Delete</a>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div class="esh-pager">
          <a
            class="esh-link-item"
            data-testid="pagination-previous"
            [class.esh-pager-item--hidden]="currentPage.pageIndex === 0"
            [routerLink]="pageLink(previousPageIndex(currentPage), currentPage.pageSize)"
          >
            Previous
          </a>
          <span>{{ pagerSummary(currentPage) }}</span>
          <a
            class="esh-link-item"
            data-testid="pagination-next"
            [class.esh-pager-item--hidden]="currentPage.pageIndex >= currentPage.totalPages - 1"
            [routerLink]="pageLink(nextPageIndex(currentPage), currentPage.pageSize)"
          >
            Next
          </a>
        </div>
      } @else {
        <p>Loading catalog items...</p>
      }
    </section>
  `,
})
export class CatalogListPageComponent {
  private readonly api = inject(CatalogApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  page?: CatalogPage;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const pageIndex = this.toNumber(params.get('index'), 0);
      const pageSize = this.toNumber(params.get('size'), 10);

      this.api
        .getCatalogPage(pageIndex, pageSize)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((page) => {
          this.page = page;
        });
    });
  }

  pageLink(pageIndex: number, pageSize: number) {
    return ['/catalog/page', pageIndex, 'size', pageSize];
  }

  previousPageIndex(page: CatalogPage) {
    return Math.max(page.pageIndex - 1, 0);
  }

  nextPageIndex(page: CatalogPage) {
    return Math.min(page.pageIndex + 1, Math.max(page.totalPages - 1, 0));
  }

  pagerSummary(page: CatalogPage) {
    return `Showing ${Math.min(page.pageSize, page.totalCount)} of ${page.totalCount} products - Page ${page.pageIndex + 1} - ${page.totalPages}`;
  }

  private toNumber(value: string | null, fallback: number) {
    if (value === null) {
      return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
}
