# Catalog Domain Model

## Core Entities

## CatalogItem

Represents a product record maintained by the application.

Fields:

- `Id`
- `Name`
- `Description`
- `Price`
- `PictureFileName`
- `PictureUri` (runtime-only, not persisted)
- `CatalogTypeId`
- `CatalogType`
- `CatalogBrandId`
- `CatalogBrand`
- `AvailableStock`
- `RestockThreshold`
- `MaxStockThreshold`
- `OnReorder`

Key validation annotations in code:

- `Price` range and decimal-format validation
- stock-related numeric ranges
- display names for UI labels

## CatalogBrand

Reference entity representing a product brand.

Fields:

- `Id`
- `Brand`

## CatalogType

Reference entity representing a product type.

Fields:

- `Id`
- `Type`

## Relationships

- a `CatalogItem` requires one `CatalogBrand`
- a `CatalogItem` requires one `CatalogType`
- brands and types are lookup/reference entities without observed back-navigation collections

## Persistence Mapping

`CatalogDBContext` defines the following mappings:

- `CatalogItem` -> table `Catalog`
- `CatalogBrand` -> table `CatalogBrand`
- `CatalogType` -> table `CatalogType`

Additional mapping behavior:

- `CatalogItem.Id` uses `DatabaseGeneratedOption.None`
- `CatalogItem.PictureUri` is ignored by EF
- `CatalogBrand.Brand` is required with max length `100`
- `CatalogType.Type` is required with max length `100`
- `CatalogItem.Name` is required with max length `50`

## Identifier Generation

Catalog item IDs are not database-generated identities. Instead, they are produced through `CatalogItemHiLoGenerator`, which obtains a high value from the SQL sequence `catalog_hilo` and serves up to ten local values per high allocation.

Brand and type seed IDs are also driven from dedicated SQL sequences.

## Seed Data

Default seed data is supplied by `PreconfiguredData.cs` and contains:

- predefined brands such as `Azure`, `.NET`, `Visual Studio`, `SQL Server`, and `Other`
- predefined product types
- a fixed set of sample catalog items referencing picture files under `Pics/`

## Customization Data Path

When `UseCustomizationData=true`, initializer logic reads:

- `Setup/CatalogTypes.csv`
- `Setup/CatalogBrands.csv`
- `Setup/CatalogItems.csv`
- `Setup/CatalogItems.zip`

The CSV reader validates required headers, resolves brand/type names to seeded IDs, and parses optional stock-related columns.

## Domain Constraints And Notes

- picture management is file-name based rather than media-managed
- stock thresholds are stored on the item record itself
- the reorder flag exists in the model and seed parser, but is not prominently exposed in the main list or edit UI
