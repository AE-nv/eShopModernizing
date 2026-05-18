import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogApiService } from './catalog-api.service';
import { CatalogItemDetails } from './catalog.models';

@Component({
  selector: 'app-catalog-delete-page',
  imports: [CommonModule, RouterLink, DecimalPipe],
  template: `
    <section class="page-card">
      <h2>Delete</h2>

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
          <button data-testid="submit-delete" type="button" (click)="deleteItem(currentItem.id)">[ Delete ]</button>
          <a class="esh-link-item" data-testid="back-to-list" routerLink="/catalog">Back to list</a>
        </div>
      } @else {
        <p>Loading item details...</p>
      }
    </section>
  `,
})
export class CatalogDeletePageComponent {
  private readonly api = inject(CatalogApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
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

  deleteItem(id: number) {
    this.api.deleteCatalogItem(id).subscribe(() => {
      void this.router.navigateByUrl('/catalog');
    });
  }
}
