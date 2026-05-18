## ADDED Requirements

### Requirement: Catalog administration list view

The system SHALL provide an Angular catalog administration list view backed by a .NET 10 ASP.NET Core Web API. The list SHALL display catalog items in a paginated table with actions to view details, edit, and delete an item.

#### Scenario: Display the first page of catalog items

- **WHEN** the user opens the catalog administration list view
- **THEN** the UI shows a create action and a table of catalog items
- **AND** each row shows the item's name, brand, type, price, and stock
- **AND** the seeded development dataset includes enough items to render ten rows on the first page
- **AND** the dataset includes `.NET Bot Black Hoodie` as a visible item on the first page

### Requirement: Route-driven pagination

The Angular application SHALL keep the current catalog page in the route, and the API SHALL support page-based catalog queries.

#### Scenario: Navigate between catalog pages

- **WHEN** the user moves from the first page to the next page
- **THEN** the route updates to represent the selected page
- **AND** the UI requests the corresponding page from the API
- **AND** the UI shows the current page number, total pages, and total item count
- **AND** the seeded development dataset supports a two-page scenario with ten items on page one and two items on page two

### Requirement: Catalog item details

The system SHALL allow a user to view the details of a single catalog item.

#### Scenario: Open an existing catalog item

- **WHEN** the user selects the details action for a catalog item
- **THEN** the application navigates to an item details view
- **AND** the UI displays the item's name, brand, type, description, price, stock, restock threshold, and max stock threshold
- **AND** the view provides navigation back to the catalog list and into edit

### Requirement: Catalog item creation

The system SHALL allow a user to create a catalog item from the Angular application through the ASP.NET Core Web API.

#### Scenario: Create a valid catalog item

- **WHEN** the user submits a create form with a name, description, brand, type, price, stock, restock threshold, and max stock threshold
- **THEN** the API persists the new catalog item
- **AND** the UI returns the user to the catalog list
- **AND** the new item appears in the list with its selected brand, type, price, and stock values

### Requirement: Catalog item editing

The system SHALL allow a user to update an existing catalog item.

#### Scenario: Edit a previously created catalog item

- **WHEN** the user opens the edit view for an existing item and saves valid changes
- **THEN** the API updates the stored catalog item
- **AND** the edit form is prepopulated with the item's current values
- **AND** the user can change brand, type, descriptive fields, price, stock, restock threshold, and max stock threshold
- **AND** the updated values are visible when the user returns to the catalog list

### Requirement: Catalog item deletion

The system SHALL require confirmation before deleting a catalog item.

#### Scenario: Delete an existing catalog item

- **WHEN** the user chooses to delete a catalog item
- **THEN** the application shows a delete confirmation view with the selected item's details
- **AND** after the user confirms deletion, the API removes the item
- **AND** the UI returns the user to the catalog list
- **AND** the deleted item no longer appears in subsequent list queries

### Requirement: Catalog reference data

The system SHALL provide catalog brands and catalog types as reference data for create and edit workflows.

#### Scenario: Load brand and type options for forms

- **WHEN** the user opens the create or edit form
- **THEN** the UI loads available catalog brands and catalog types from the API
- **AND** the available brands include `Azure`, `.NET`, `Visual Studio`, `SQL Server`, and `Other`
- **AND** the available types include `Mug`, `T-Shirt`, `Sheet`, and `USB Memory Stick`

### Requirement: Validation rules for catalog items

The API SHALL reject invalid catalog item input, and the Angular UI SHALL present the validation feedback.

#### Scenario: Reject invalid price and stock input

- **WHEN** the user submits a catalog item with a negative price, a price with more than two decimal places, or negative stock values
- **THEN** the API returns validation errors
- **AND** the UI keeps the user on the current form and shows field-level validation messages

#### Scenario: Reject missing required input

- **WHEN** the user submits a catalog item without a name, brand selection, or type selection
- **THEN** the API returns validation errors
- **AND** the UI keeps the user on the current form and shows field-level validation messages

### Requirement: Modern target architecture

The catalog administration capability SHALL be implemented as an Angular frontend integrated with a .NET 10 ASP.NET Core Web API backend.

#### Scenario: Separate UI and API responsibilities

- **WHEN** the capability is implemented
- **THEN** the Angular frontend is responsible for navigation, rendering, and form interaction
- **AND** the ASP.NET Core Web API is responsible for CRUD operations, reference data retrieval, pagination, and validation
- **AND** the implementation does not depend on ASP.NET Web Forms runtime features
