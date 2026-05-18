# Functional And Technical Requirements

## Functional Requirements

### FR-1 List Catalog Items

The system shall display catalog items in a paginated table showing image, name, description, brand, type, price, picture name, stock, restock threshold, and max stock.

### FR-2 Navigate Between Pages Of Results

The system shall support page-based navigation through catalog items using route-based pagination parameters.

### FR-3 View Item Details

The system shall allow a user to open a details page for a single catalog item.

### FR-4 Create Catalog Item

The system shall allow a user to create a catalog item by supplying name, description, brand, type, price, stock, restock threshold, and max stock threshold.

### FR-5 Edit Catalog Item

The system shall allow a user to update an existing catalog item, including brand, type, descriptive fields, price, and stock values.

### FR-6 Delete Catalog Item

The system shall allow a user to delete a catalog item after viewing a confirmation page.

### FR-7 Provide Brand And Type Reference Data

The system shall provide selectable catalog brands and catalog types when creating or editing items.

## Data Validation Requirements

### DV-1 Price Validation

Price shall be a non-negative numeric value with up to two decimal places.

### DV-2 Stock Validation

Available stock, restock threshold, and max stock threshold shall be non-negative integers.

### DV-3 Required Fields

Name shall be required. Brand and type shall be selected from available reference data.

## Technical Requirements Derived From Implementation

### TR-1 Runtime Framework

The application shall run on ASP.NET Web Forms and .NET Framework 4.7.2.

### TR-2 Dependency Injection

The application shall obtain page dependencies through Autofac Web Forms property injection.

### TR-3 Service Abstraction

Catalog CRUD operations shall be routed through `ICatalogService`.

### TR-4 Data Mode Switching

The application shall support a mock-data mode and a database-backed mode controlled by `UseMockData`.

### TR-5 Persistence Model

In database mode, the application shall persist catalog items, brands, and types through Entity Framework 6.

### TR-6 Database Initialization

When database mode is enabled, the application shall initialize the database using `CreateDatabaseIfNotExists` seeding logic.

### TR-7 Identifier Generation

Catalog item identifiers shall be generated through the custom SQL sequence / HiLo mechanism.

### TR-8 Observability

The application shall emit logs through log4net and register Application Insights HTTP telemetry modules.

## Non-Functional Concerns Observed

### NFR-1 Security Gap

The implementation should protect create, edit, and delete capabilities with authentication and authorization. This behavior is not currently observed.

### NFR-2 Input Safety

The implementation should avoid disabling request validation on edit and create pages unless there is a documented and justified reason.

### NFR-3 Maintainability

The implementation should reduce tight coupling to page lifecycle, session state, and initializer-based persistence bootstrap for easier modernization.
