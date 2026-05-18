import { Routes } from '@angular/router';
import { CatalogDeletePageComponent } from './catalog-delete-page.component';
import { CatalogDetailsPageComponent } from './catalog-details-page.component';
import { CatalogFormPageComponent } from './catalog-form-page.component';
import { CatalogListPageComponent } from './catalog-list-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full',
  },
  {
    path: 'catalog',
    component: CatalogListPageComponent,
  },
  {
    path: 'catalog/page/:index/size/:size',
    component: CatalogListPageComponent,
  },
  {
    path: 'Catalog/Create',
    component: CatalogFormPageComponent,
    data: { mode: 'create' },
  },
  {
    path: 'Catalog/Details/:id',
    component: CatalogDetailsPageComponent,
  },
  {
    path: 'Catalog/Edit/:id',
    component: CatalogFormPageComponent,
    data: { mode: 'edit' },
  },
  {
    path: 'Catalog/Delete/:id',
    component: CatalogDeletePageComponent,
  },
  {
    path: '**',
    redirectTo: 'catalog',
  },
];
