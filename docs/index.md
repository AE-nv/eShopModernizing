# eShop Legacy Web Forms Documentation

## Overview

This documentation describes the application implemented in `eShopLegacyWebFormsSolution/src/eShopLegacyWebForms`.

The application is a small ASP.NET Web Forms catalog administration site. It lists catalog items and allows users to create, inspect, edit, and delete them through server-rendered pages.

## Documents

- `system-overview.md`: high-level architecture, runtime stack, and module boundaries.
- `discovery/legacy-webforms-application.md`: discovered pages, routes, services, startup behavior, and technical observations.
- `business/catalog-admin-application.md`: business-oriented description of what the application does.
- `functional/catalog-management-requirements.md`: functional and technical requirements derived from the implementation.
- `domain/catalog-domain-model.md`: catalog entities, relationships, persistence model, and seed data behavior.
- `verification/verification-report.md`: source-based verification notes, limitations, and risks.
- `traceability/requirements-traceability.md`: mapping from requirements to code locations.

## Key Findings

- The application behaves as a catalog administration tool, not as a customer-facing storefront.
- The default configuration uses mock in-memory data via `UseMockData=true` in `Web.config`.
- Database-backed mode uses Entity Framework 6 with code-first mapping and initializer-based seeding.
- Create, edit, and delete operations are exposed without an observed authentication or authorization barrier.
