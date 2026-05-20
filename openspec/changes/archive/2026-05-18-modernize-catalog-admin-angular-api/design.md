## Context

The existing `docs/` set describes a legacy catalog administration module implemented in ASP.NET Web Forms. The Playwright suite in `tests/goldenmaster.spec.ts` captures the key end-to-end business flows and concrete sample data currently observable in the legacy UI.

This change defines the target behavior for a replacement implementation using:

- .NET 10 ASP.NET Core Web API for catalog and reference-data operations
- Angular for the catalog administration user interface

The goal is behavioral continuity for catalog administrators, not a page-for-page Web Forms port.

## Goals / Non-Goals

**Goals:**

- Preserve the functional requirements documented as FR-1 through FR-7.
- Preserve the validation requirements for required fields, numeric price input, and integer stock values.
- Define backend and frontend responsibilities clearly enough to guide implementation.
- Keep a deterministic development dataset that supports the documented list and pagination scenarios.

**Non-Goals:**

- Reproduce Web Forms server controls, master pages, or ASPX route shapes.
- Preserve Autofac property injection, EF6 initializers, log4net, or Application Insights setup from the legacy application.
- Define deployment, authentication provider, or infrastructure automation in detail.

## Decisions

### Decision 1: Preserve behavior, not Web Forms mechanics

The new system should preserve the catalog administration outcomes exercised by the existing docs and Playwright suite, but it should express them through Angular routes and JSON API endpoints instead of server-rendered ASPX pages.

### Decision 2: Split responsibilities between Angular and API

The Angular application owns navigation, list rendering, form interaction, and confirmation flows. The ASP.NET Core Web API owns catalog persistence, reference data retrieval, pagination, validation, and concurrency-safe CRUD behavior.

### Decision 3: Use explicit API contracts for admin workflows

The API should expose endpoints for:

- paginated catalog item queries
- single item retrieval
- catalog item creation
- catalog item update
- catalog item deletion
- catalog brands lookup
- catalog types lookup

This keeps the Angular client thin and makes functional verification straightforward.

### Decision 4: Seed deterministic reference and sample catalog data

The documented scenarios and the current Playwright suite depend on known sample brands, types, item names, and a dataset large enough to exercise pagination. The modernized solution should provide deterministic seed data for development and test environments so those scenarios remain stable.

### Decision 5: Enforce validation on the API boundary

Legacy UI validation should be replaced with ASP.NET Core request validation and clear validation responses. Angular should mirror those rules in forms for user feedback, but the API remains the source of truth.

## Implementation Outline

1. Create a .NET 10 ASP.NET Core Web API for catalog items, brands, and types.
2. Model paginated list responses that include total item count, current page, and page size.
3. Create Angular routes for list, create, details, edit, and delete-confirmation flows.
4. Build Angular screens and forms against the API contracts.
5. Seed brands, types, and at least twelve catalog items matching the documented examples.
6. Update or replace end-to-end coverage so the modernized UI is verified against the same functional expectations.

## Risks

- The existing Playwright suite is tightly coupled to Web Forms route and selector conventions, so implementation alone will not make that suite pass unchanged.
- Seed data drift would make pagination and row-content assertions unstable.
- If create, edit, and delete flows are implemented before reference-data endpoints, forms will be blocked.
