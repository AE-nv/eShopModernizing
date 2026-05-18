import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogApiService } from './catalog-api.service';
import { CatalogItemDetails } from './catalog.models';

@Component({
  selector: 'app-catalog-details-page',
  imports: [CommonModule, RouterLink, DecimalPipe],
  template: `
    <section class="page-card">
      <h2>Details</h2>

      @if (item; as currentItem) {
        <dl class="details-grid" data-testid="catalog-details">
          <dt>Name</dt>
          <dd>{{ currentItem.name }}</dd>
          <dt>Description</dt>
          <dd>{{ currentItem.description }}</dd>
          <dt>Brand</dt>
          <dd>{{ currentItem.brand }}</dd>
          <dt>Type</dt>
          <dd>{{ currentItem.type }}</dd>
          <dt>Price</dt>
          <dd>{{ currentItem.price | number: '1.2-2' }}</dd>
          <dt>Picture name</dt>
          <dd>{{ currentItem.pictureFileName }}</dd>
          <dt>Stock</dt>
          <dd>{{ currentItem.availableStock }}</dd>
          <dt>Restock</dt>
          <dd>{{ currentItem.restockThreshold }}</dd>
          <dt>Max stock</dt>
          <dd>{{ currentItem.maxStockThreshold }}</dd>
        </dl>

        <div class="page-actions" style="margin-top: 1.5rem;">
          <a class="esh-link-item" data-testid="edit-item" [routerLink]="['/Catalog/Edit', currentItem.id]">Edit</a>
          <a class="esh-link-item" data-testid="back-to-list" routerLink="/catalog">Back to list</a>
        </div>
      } @else {
        <p>Loading item details...</p>
      }
    </section>
  `,
})
export class CatalogDetailsPageComponent {
  private readonly api = inject(CatalogApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  item?: CatalogItemDetails;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number.parseInt(params.get('id') ?? '', 10);
      if (Number.isNaN(id)) {
        this.item = undefined;
        return;
      }

      this.api
        .getCatalogItem(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((item) => {
          this.item = item;
        });
    });
  }
}
