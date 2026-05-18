# System Overview

## Purpose

`eShopLegacyWebForms` is a legacy ASP.NET Web Forms application for maintaining a product catalog. Its primary business capability is catalog item administration: viewing paginated catalog data and performing create, read, update, and delete operations.

## Runtime Stack

- UI framework: ASP.NET Web Forms
- Language: C#
- Runtime: .NET Framework 4.7.2
- Dependency injection: Autofac Web Forms integration
- Persistence: Entity Framework 6 with SQL Server / LocalDB
- Logging: log4net
- Telemetry: Application Insights
- Session state: InProc plus async session module registration

## Application Structure

## Presentation

- `Default.aspx`: paginated list of catalog items.
- `Catalog/Create.aspx`: create a new catalog item.
- `Catalog/Edit.aspx`: update an existing catalog item.
- `Catalog/Details.aspx`: inspect a single item.
- `Catalog/Delete.aspx`: confirm and delete an item.
- `Site.Master`: shared layout and footer/session display.

## Service Layer

- `ICatalogService`: CRUD and lookup abstraction used by Web Forms pages.
- `CatalogService`: Entity Framework implementation.
- `CatalogServiceMock`: in-memory implementation backed by preconfigured seed data.

## Domain and Persistence

- `CatalogItem`, `CatalogBrand`, and `CatalogType` are the core entities.
- `CatalogDBContext` defines EF mappings and relationships.
- `CatalogDBInitializer` seeds types, brands, items, sequences, and optional pictures.
- `CatalogItemHiLoGenerator` allocates item identifiers from a SQL sequence.

## Startup Flow

At application startup, `Global.asax.cs` registers routes and bundles, builds the Autofac container, and conditionally configures the EF initializer when mock data is disabled.

At session start, the application stores the machine name and session start time in session state. `Site.Master` displays that session data on the page.

At request start, the application populates log4net context properties for request logging and correlation.

## Routing

Routes are registered in `App_Start/RouteConfig.cs`.

- `Default`
- `Default/index/{index}/size/{size}`
- `Catalog/Create`
- `Catalog/Edit/{id}`
- `Catalog/Details/{id}`
- `Catalog/Delete/{id}`

## Deployment and Data Modes

The application supports two operating modes.

- Mock mode: default mode, using `CatalogServiceMock` with preconfigured in-memory data.
- Database mode: EF-backed mode, using `CatalogService`, `CatalogDBContext`, and initializer seeding against the `CatalogDBContext` connection string.

## Architectural Observations

- Web Forms pages depend on page lifecycle and server control binding.
- Dependency injection uses property injection into page classes rather than constructor injection.
- Persistence bootstrap relies on EF initializer behavior instead of migrations.
- Several behaviors are tightly coupled to configuration and application hosting paths.
