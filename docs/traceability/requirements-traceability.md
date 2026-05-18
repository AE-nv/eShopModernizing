# Requirements Traceability

| Requirement | Description | Primary Source Evidence |
| --- | --- | --- |
| FR-1 | List catalog items | `Default.aspx`, `Default.aspx.cs`, `Services/CatalogService.cs` |
| FR-2 | Route-based pagination | `App_Start/RouteConfig.cs`, `Default.aspx.cs` |
| FR-3 | View item details | `Catalog/Details.aspx`, `Catalog/Details.aspx.cs` |
| FR-4 | Create catalog item | `Catalog/Create.aspx`, `Catalog/Create.aspx.cs`, `Services/ICatalogService.cs` |
| FR-5 | Edit catalog item | `Catalog/Edit.aspx`, `Catalog/Edit.aspx.cs`, `Services/ICatalogService.cs` |
| FR-6 | Delete catalog item | `Catalog/Delete.aspx`, `Catalog/Delete.aspx.cs`, `Services/ICatalogService.cs` |
| FR-7 | Reference data for brands and types | `Services/CatalogService.cs`, `Services/CatalogServiceMock.cs`, `Models/Infrastructure/PreconfiguredData.cs` |
| DV-1 | Price validation | `Models/CatalogItem.cs`, `Catalog/Create.aspx`, `Catalog/Edit.aspx` |
| DV-2 | Stock validation | `Models/CatalogItem.cs`, `Catalog/Create.aspx`, `Catalog/Edit.aspx` |
| DV-3 | Required item name | `Catalog/Create.aspx`, `Catalog/Edit.aspx`, `Models/CatalogItem.cs` |
| TR-1 | Web Forms on .NET Framework 4.7.2 | `eShopLegacyWebForms.csproj`, `Web.config` |
| TR-2 | Autofac property injection | `Global.asax.cs`, `Modules/ApplicationModule.cs`, `Web.config` |
| TR-3 | Service abstraction | `Services/ICatalogService.cs` |
| TR-4 | Mock and database modes | `Web.config`, `Global.asax.cs`, `Modules/ApplicationModule.cs` |
| TR-5 | EF6 persistence model | `Models/CatalogDBContext.cs`, `Services/CatalogService.cs` |
| TR-6 | Initializer-based database seed | `Models/Infrastructure/CatalogDBInitializer.cs`, `Global.asax.cs` |
| TR-7 | SQL sequence and HiLo ID generation | `Models/CatalogItemHiLoGenerator.cs`, `Models/Infrastructure/*.sql`, `Services/CatalogService.cs` |
| TR-8 | Logging and telemetry | `log4Net.xml`, `Global.asax.cs`, `Web.config`, `ApplicationInsights.config` |
| NFR-1 | Access control should protect mutations | gap identified from `Default.aspx`, `Catalog/*.aspx.cs`, `Web.config` |
| NFR-2 | Request validation should not be disabled without justification | `Catalog/Create.aspx`, `Catalog/Edit.aspx`, `Web.config` |
| NFR-3 | Maintainability risk from framework coupling | `Default.aspx.cs`, `Global.asax.cs`, `Site.Master.cs`, `Models/Infrastructure/CatalogDBInitializer.cs` |
