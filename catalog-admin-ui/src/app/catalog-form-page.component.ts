import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { CatalogApiService } from './catalog-api.service';
import { CatalogItemDetails, CatalogItemRequest, LookupItem, ValidationProblem } from './catalog.models';

@Component({
  selector: 'app-catalog-form-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-card">
      <h2>{{ isEditMode ? 'Edit' : 'Create' }}</h2>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-grid">
          <div class="form-field form-field--full">
            <label for="MainContent_Name">Name</label>
            <input id="MainContent_Name" data-testid="field-name" type="text" formControlName="name" aria-label="Name" />
            @if (errorMessage('name'); as message) {
              <div class="field-error">{{ message }}</div>
            }
          </div>

          <div class="form-field form-field--full">
            <label for="MainContent_Description">Description</label>
            <textarea id="MainContent_Description" data-testid="field-description" rows="4" formControlName="description" aria-label="Description"></textarea>
          </div>

          <div class="form-field">
            <label [for]="brandSelectId">Brand</label>
            <select [id]="brandSelectId" data-testid="field-brand" formControlName="catalogBrandId" aria-label="Brand">
              <option value="">Select a brand</option>
              @for (brand of brands; track brand.id) {
                <option [value]="brand.id">{{ brand.name }}</option>
              }
            </select>
            @if (errorMessage('catalogBrandId'); as message) {
              <div class="field-error">{{ message }}</div>
            }
          </div>

          <div class="form-field">
            <label [for]="typeSelectId">Type</label>
            <select [id]="typeSelectId" data-testid="field-type" formControlName="catalogTypeId" aria-label="Type">
              <option value="">Select a type</option>
              @for (type of types; track type.id) {
                <option [value]="type.id">{{ type.name }}</option>
              }
            </select>
            @if (errorMessage('catalogTypeId'); as message) {
              <div class="field-error">{{ message }}</div>
            }
          </div>

          <div class="form-field">
            <label for="MainContent_Price">Price</label>
            <input id="MainContent_Price" data-testid="field-price" type="number" step="0.01" min="0" formControlName="price" aria-label="Price" />
            @if (errorMessage('price'); as message) {
              <div class="field-error">{{ message }}</div>
            }
          </div>

          <div class="form-field">
            <label for="MainContent_Stock">Stock</label>
            <input id="MainContent_Stock" data-testid="field-stock" type="number" step="1" min="0" formControlName="availableStock" aria-label="Stock" />
            @if (errorMessage('availableStock'); as message) {
              <div class="field-error">{{ message }}</div>
            }
          </div>

          <div class="form-field">
            <label for="MainContent_Restock">Restock</label>
            <input id="MainContent_Restock" data-testid="field-restock" type="number" step="1" min="0" formControlName="restockThreshold" aria-label="Restock" />
            @if (errorMessage('restockThreshold'); as message) {
              <div class="field-error">{{ message }}</div>
            }
          </div>

          <div class="form-field">
            <label for="MainContent_Maxstock">Max stock</label>
            <input id="MainContent_Maxstock" data-testid="field-max-stock" type="number" step="1" min="0" formControlName="maxStockThreshold" aria-label="Max stock" />
            @if (errorMessage('maxStockThreshold'); as message) {
              <div class="field-error">{{ message }}</div>
            }
          </div>
        </div>

        @if (formError; as message) {
          <div class="form-error">{{ message }}</div>
        }

        <div class="page-actions" style="margin-top: 1.5rem;">
          <button [attr.data-testid]="isEditMode ? 'submit-save' : 'submit-create'" type="submit">{{ isEditMode ? '[ Save ]' : '[ Create ]' }}</button>
          <a class="esh-link-item" data-testid="back-to-list" routerLink="/catalog">Back to list</a>
        </div>
      </form>
    </section>
  `,
})
export class CatalogFormPageComponent {
  private readonly api = inject(CatalogApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isEditMode = this.route.snapshot.data['mode'] === 'edit';
  readonly brandSelectId = this.isEditMode ? 'MainContent_BrandDropDownList' : 'MainContent_Brand';
  readonly typeSelectId = this.isEditMode ? 'MainContent_TypeDropDownList' : 'MainContent_Type';

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    catalogBrandId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    catalogTypeId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    price: new FormControl('', { nonNullable: true, validators: [Validators.required, twoDecimalValidator(), nonNegativeNumberValidator()] }),
    availableStock: new FormControl('', { nonNullable: true, validators: [Validators.required, integerValidator()] }),
    restockThreshold: new FormControl('', { nonNullable: true, validators: [Validators.required, integerValidator()] }),
    maxStockThreshold: new FormControl('', { nonNullable: true, validators: [Validators.required, integerValidator()] }),
  });

  brands: LookupItem[] = [];
  types: LookupItem[] = [];
  itemId?: number;
  formError = '';

  constructor() {
    const rawId = this.route.snapshot.paramMap.get('id');
    const itemId = rawId ? Number.parseInt(rawId, 10) : undefined;
    this.itemId = Number.isNaN(itemId) ? undefined : itemId;

    forkJoin({
      brands: this.api.getCatalogBrands(),
      types: this.api.getCatalogTypes(),
      item: this.isEditMode && this.itemId ? this.api.getCatalogItem(this.itemId) : of(undefined),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ brands, types, item }) => {
        this.brands = brands;
        this.types = types;

        if (item) {
          this.patchForm(item);
        }
      });
  }

  submit() {
    this.formError = '';
    this.clearApiErrors();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.toRequest();
    const request$ = this.isEditMode && this.itemId
      ? this.api.updateCatalogItem(this.itemId, request)
      : this.api.createCatalogItem(request);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        void this.router.navigateByUrl('/catalog');
      },
      error: (error: HttpErrorResponse) => {
        this.applyServerErrors(error);
      },
    });
  }

  errorMessage(controlName: string) {
    const control = this.form.get(controlName);
    if (!control || !(control.touched || control.dirty)) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('twoDecimals')) {
      return 'The field Price must be a positive number with maximum two decimals.';
    }

    if (control.hasError('nonNegative')) {
      return 'The value must be zero or greater.';
    }

    if (control.hasError('integer')) {
      return 'The value must be a non-negative integer.';
    }

    if (control.hasError('api')) {
      return control.getError('api') as string;
    }

    return '';
  }

  private patchForm(item: CatalogItemDetails) {
    this.form.setValue({
      name: item.name,
      description: item.description,
      catalogBrandId: String(item.catalogBrandId),
      catalogTypeId: String(item.catalogTypeId),
      price: item.price.toFixed(2),
      availableStock: String(item.availableStock),
      restockThreshold: String(item.restockThreshold),
      maxStockThreshold: String(item.maxStockThreshold),
    });
  }

  private toRequest(): CatalogItemRequest {
    const value = this.form.getRawValue();

    return {
      name: value.name.trim(),
      description: value.description.trim(),
      catalogBrandId: Number(value.catalogBrandId),
      catalogTypeId: Number(value.catalogTypeId),
      price: Number(value.price),
      availableStock: Number(value.availableStock),
      restockThreshold: Number(value.restockThreshold),
      maxStockThreshold: Number(value.maxStockThreshold),
    };
  }

  private clearApiErrors() {
    Object.values(this.form.controls).forEach((control) => {
      const errors = control.errors ?? {};
      if (!('api' in errors)) {
        return;
      }

      const nextErrors = { ...errors } as Record<string, unknown>;
      delete nextErrors['api'];
      control.setErrors(Object.keys(nextErrors).length > 0 ? nextErrors : null);
    });
  }

  private applyServerErrors(error: HttpErrorResponse) {
    const problem = error.error as ValidationProblem | undefined;
    const errors = problem?.errors;

    if (!errors) {
      this.formError = 'The catalog item could not be saved.';
      return;
    }

    const controlMap: Record<string, string> = {
      Name: 'name',
      name: 'name',
      CatalogBrandId: 'catalogBrandId',
      catalogBrandId: 'catalogBrandId',
      CatalogTypeId: 'catalogTypeId',
      catalogTypeId: 'catalogTypeId',
      Price: 'price',
      price: 'price',
      AvailableStock: 'availableStock',
      availableStock: 'availableStock',
      RestockThreshold: 'restockThreshold',
      restockThreshold: 'restockThreshold',
      MaxStockThreshold: 'maxStockThreshold',
      maxStockThreshold: 'maxStockThreshold',
    };

    let mappedError = false;

    for (const [key, messages] of Object.entries(errors)) {
      const controlName = controlMap[key];
      if (!controlName) {
        continue;
      }

      const control = this.form.get(controlName);
      if (!control) {
        continue;
      }

      mappedError = true;
      control.setErrors({ ...(control.errors ?? {}), api: messages[0] });
      control.markAsTouched();
    }

    if (!mappedError) {
      this.formError = 'The catalog item could not be saved.';
    }
  }
}

function twoDecimalValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === '') {
      return null;
    }

    return /^\d+(\.\d{1,2})?$/.test(control.value) ? null : { twoDecimals: true };
  };
}

function nonNegativeNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === '') {
      return null;
    }

    return Number(control.value) >= 0 ? null : { nonNegative: true };
  };
}

function integerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === '') {
      return null;
    }

    return /^\d+$/.test(control.value) ? null : { integer: true };
  };
}
