# Discovery: Legacy Web Forms Application

## Solution and Project

- Solution: `eShopLegacyWebFormsSolution/eShopLegacyWebForms.sln`
- Web application project: `eShopLegacyWebFormsSolution/src/eShopLegacyWebForms/eShopLegacyWebForms.csproj`
- Project type: classic ASP.NET Web Application with Web Forms project type GUIDs
- Target framework: `.NET Framework 4.7.2`

## Page Inventory

## Main Pages

- `Default.aspx`: catalog list with pagination and action links.
- `Catalog/Create.aspx`: data entry form for new catalog items.
- `Catalog/Edit.aspx`: edit form for existing items.
- `Catalog/Details.aspx`: read-only item details page.
- `Catalog/Delete.aspx`: delete confirmation page.

## Secondary Pages

- `About.aspx`
- `Contact.aspx`
- `ViewSwitcher.ascx` and `Site.Mobile.Master`: leftover mobile/friendly URL era artifacts.

## User Flows

## List Flow

`Default.aspx.cs` obtains an `ICatalogService` through Autofac property injection and loads a `PaginatedItemsViewModel<CatalogItem>` during `Page_Load`.

If route values `size` and `index` are present, the page uses those for pagination. Otherwise it defaults to page index `0` and page size `10`.

The page binds the result set to a `ListView` and renders `Edit`, `Details`, and `Delete` hyperlinks for each row. A `Create New` action is always visible.

## Create Flow

`Catalog/Create.aspx` renders dropdowns for brands and types through page methods `GetBrands()` and `GetTypes()`.

On `Create_Click`, `Create.aspx.cs` checks `ModelState.IsValid`, manually constructs a `CatalogItem`, parses numeric inputs, calls `CatalogService.CreateCatalogItem`, and redirects to `~`.

Observed limitations:

- `ValidateRequest="false"` is enabled on the page.
- Image upload is explicitly not supported.
- Parsing uses `int.Parse` and `decimal.Parse` directly.

## Edit Flow

`Catalog/Edit.aspx.cs` reads the route value `id` on first load, fetches the item through the service, binds brand and type dropdowns, and calls `DataBind()`.

On `Save_Click`, the page builds a fresh `CatalogItem` instance from form values and sends it to `CatalogService.UpdateCatalogItem`.

Observed limitations:

- `ValidateRequest="false"` is enabled.
- The update path overwrites the entity from page inputs rather than merging a loaded tracked entity.
- Input conversion is manual.

## Details Flow

`Catalog/Details.aspx.cs` loads a single item by route `id`, binds the item to the page, and exposes an `Edit` link and a `Back to list` link.

## Delete Flow

`Catalog/Delete.aspx.cs` loads the item by route `id`, binds a confirmation view, and deletes the item on `Delete_Click` before redirecting to the home page.

## Routing

Routes are defined in `App_Start/RouteConfig.cs` using `MapPageRoute`.

| Route Name | Pattern | Target |
| --- | --- | --- |
| default route | `Default` | `~/Default.aspx` |
| `ProductsByPageRoute` | `Default/index/{index}/size/{size}` | `~/Default.aspx` |
| `CreateProductRoute` | `Catalog/Create` | `~/Catalog/Create.aspx` |
| `EditProductRoute` | `Catalog/Edit/{id}` | `~/Catalog/Edit.aspx` |
| `ProductDetailsRoute` | `Catalog/Details/{id}` | `~/Catalog/Details.aspx` |
| `DeleteProductRoute` | `Catalog/Delete/{id}` | `~/Catalog/Delete.aspx` |

## Dependency Injection

Autofac is configured in `Global.asax.cs` via `ConfigureContainer()`.

Registrations are defined in `Modules/ApplicationModule.cs`.

- When `UseMockData=true`, `ICatalogService` resolves to `CatalogServiceMock` as a singleton.
- When `UseMockData=false`, `ICatalogService` resolves to `CatalogService` per lifetime scope.
- `CatalogDBContext` and `CatalogDBInitializer` are lifetime-scoped.
- `CatalogItemHiLoGenerator` is registered as a singleton.

Property injection is enabled by Autofac HTTP modules declared in `Web.config`.

## Startup and Runtime Behavior

`Global.asax.cs` performs these actions:

- registers routes
- registers bundles
- builds the Autofac container
- configures the EF initializer only when database mode is active
- stores `MachineName` and `SessionStartTime` in session on `Session_Start`
- adds request-scoped log properties during `Application_BeginRequest`

`Site.Master.cs` reads session values directly and displays them in the layout.

## Persistence Model

`CatalogDBContext` maps three entity sets.

- `CatalogItems` -> table `Catalog`
- `CatalogBrands` -> table `CatalogBrand`
- `CatalogTypes` -> table `CatalogType`

Relationships:

- each `CatalogItem` requires one `CatalogBrand`
- each `CatalogItem` requires one `CatalogType`

`CatalogItem.PictureUri` is ignored by EF.

## Seeding and Customization

In database mode, `CatalogDBInitializer` derives from `CreateDatabaseIfNotExists<CatalogDBContext>` and seeds data in this order:

1. create SQL sequences from embedded SQL files
2. add catalog types
3. add catalog brands
4. add catalog items
5. optionally replace pictures from `Setup/CatalogItems.zip`

Seed sources:

- default source: `Models/Infrastructure/PreconfiguredData.cs`
- customization source: CSV and ZIP files under `Setup/`

## Configuration

Key configuration from `Web.config`:

- `UseMockData=true`
- `UseCustomizationData=false`
- connection string `CatalogDBContext` points to LocalDB and database `Microsoft.eShopOnContainers.Services.CatalogDb`
- `sessionState mode="InProc"`
- `httpRuntime requestValidationMode="2.0"`

## Observed Legacy Constraints

- no authentication or authorization checks were observed around create, edit, or delete routes
- Web Forms page lifecycle and property injection create strong framework coupling
- EF initializer and SQL scripts are used instead of migrations
- database setup is coupled to SQL sequence scripts and a fixed database name convention
- session state is used for UI concerns
- logging configuration appears to set `activityid` in code but render `%property{activity}` in log4net layout, which may prevent the intended correlation value from appearing
