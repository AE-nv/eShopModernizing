## Why

The current documentation and Playwright coverage describe a complete catalog administration workflow, but the implementation behind that behavior is a legacy ASP.NET Web Forms application on .NET Framework 4.7.2. We need a modernization change that preserves the documented catalog management behavior while moving the solution to a .NET 10 ASP.NET Core Web API backend with an Angular frontend.

## What Changes

- Define the modernized catalog administration capability in OpenSpec based on the existing functional documentation and Playwright scenarios.
- Preserve the current business behaviors for listing, paging, viewing, creating, editing, and deleting catalog items.
- Introduce explicit API, UI, validation, and seed-data expectations needed to implement the workflow on ASP.NET Core Web API and Angular.
- Replace Web Forms specific technical assumptions with target-architecture requirements suitable for .NET 10 and Angular.

## Capabilities

### New Capabilities

- `catalog-admin`: Angular-based catalog administration backed by a .NET 10 ASP.NET Core Web API.

## Impact

- `openspec/changes/modernize-catalog-admin-angular-api/specs/catalog-admin/spec.md`: defines the required modernized behavior.
- `openspec/changes/modernize-catalog-admin-angular-api/design.md`: records architecture and delivery decisions.
- `openspec/changes/modernize-catalog-admin-angular-api/tasks.md`: provides the implementation checklist.
- Future implementation is expected to touch the new ASP.NET Core API project, Angular application, test data setup, and end-to-end tests.
