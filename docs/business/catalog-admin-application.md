# Business View: Catalog Admin Application

## Business Purpose

The application supports maintenance of a product catalog. It allows an operator to review the current catalog, inspect individual items, add new items, update existing items, and remove items that should no longer appear in the catalog.

## Primary Business Capabilities

- View a paginated list of products.
- Inspect core product attributes.
- Create a product with brand, type, pricing, and stock information.
- Update product details and stock thresholds.
- Remove a product from the catalog.

## Product Information Managed

Each catalog item contains:

- product name
- description
- brand
- type
- price
- picture file name
- available stock
- restock threshold
- maximum stock threshold
- reorder flag

## Operational Flow

An operator starts from the catalog list page, where all items are displayed in a table. From there the operator can:

- create a new item
- open an item in a read-only details view
- edit an existing item
- delete an item after confirmation

After create, update, or delete, the operator is returned to the main list.

## Business Rules Observed in the Implementation

- catalog items must be assigned to a brand and a type
- price must be non-negative and limited to two decimal places
- stock, restock threshold, and max stock must be non-negative integers within configured validation ranges
- image upload is not supported in this implementation; a picture file name references an existing asset

## Business Boundaries

The current implementation does not show customer shopping behavior such as browsing for purchase, basket management, checkout, payment, or order history. It behaves as an internal catalog maintenance application rather than a full e-commerce storefront.

## Business Risks

- destructive maintenance actions are directly available in the UI without an observed access-control layer
- mock data is the default runtime mode, which can make non-production demonstrations differ from real persistence behavior
- the application is tightly coupled to legacy Web Forms patterns, making future change slower and riskier
