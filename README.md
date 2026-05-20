# .NET Framework Web Forms Legacy Modernization with AI

The original source repo has various types of legacy .NET Framework apps. For the scope of this demo (AG Insurance RFP) we only retain the 'Browser with WebForms' app.

## Getting started

NOTE: This repository contains the 'end solution'
To get started: clone this repository and delete all dolders except the `eShopLegacyWebFormsSolution`.

## The legacy .NET Framework Web Forms app

### Prerequisites

- Visual Studio with ASP.NET and web tooling installed
- .NET Framework 4.7.2 targeting pack
- MSBuild from Visual Studio
- IIS Express
- Internet access to restore NuGet packages from nuget.org on a clean checkout

Optional prerequisites:

- SQL LocalDB only if you want to run against a real database

Notes:

- The app builds and runs in its default mock-data configuration, so SQL Server or LocalDB is not required for a basic local run.
- The legacy repo-local `nuget.exe` is not needed for this solution. Restore works with MSBuild using `RestorePackagesConfig=true`.

### Run it locally

Run these commands from the repository root in PowerShell:

```powershell
cd eShopLegacyWebFormsSolution

$vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
$vs = & $vswhere -latest -products * -property installationPath
$msbuild = Join-Path $vs 'MSBuild\Current\Bin\MSBuild.exe'

& $msbuild .\eShopLegacyWebForms.sln /t:Restore /p:RestorePackagesConfig=true /nologo
& $msbuild .\src\eShopLegacyWebForms\eShopLegacyWebForms.csproj /p:Configuration=Debug /p:VisualStudioVersion=18.0 /nologo
& 'C:\Program Files\IIS Express\iisexpress.exe' /path:"c:\Users\WouterVanRanst\repos\ae-eshopmodernizing\eShopModernizing\eShopLegacyWebFormsSolution\src\eShopLegacyWebForms" /port:50586
```

Then open:

- `http://localhost:50586/`

Stop the site by pressing `Q` in the IIS Express console.

### Running with a real database

If you want to use a real database instead of mock data:

- Change `UseMockData` to `false` in `eShopLegacyWebFormsSolution/src/eShopLegacyWebForms/Web.config`
- Ensure SQL LocalDB is installed and the `MSSQLLocalDB` instance is available
- Verify the `CatalogDBContext` connection string in `eShopLegacyWebFormsSolution/src/eShopLegacyWebForms/Web.config`


## Stage 1: Code to Docs

### Create the Documentation with the agents

Prompt:

```
make the documentation for the applicaion in eShopLegacyWebFormsSolution
```

### Create the Golden Master with Playwright MCP

Prompt:

```
Install and configure https://github.com/microsoft/playwright-mcp
```

Prompt:

```
Refer generate-tests.prompt.md. Generate playwright tests for the functional requirements (FR) in docs\traceability\requirements-traceability.md. Refer the README.md on how to start up the application. Work with Microsoft Edge as a as a browser. Make one test per FR. The suite must be agnostic between the legacy Web Forms UI and the modernized Angular UI: use a shared UI contract based on accessible roles, labels, and prescribed `data-testid` attributes; avoid framework-specific IDs, classes, and DOM structure; isolate only unavoidable startup and route differences in a small app-profile/config layer.
```

### Run the Golden Master against the legacy application

Use the `webforms` Playwright project:

```powershell
npx playwright test tests/catalog-functional-requirements.spec.ts --project webforms --headed
```


## Stage 2: Docs to Code

### Prerequisites

- .NET 10 SDK
- Node.js and npm
- A spec driven development framework to your choosing: for this demo, we go with openspec.

### Initialize

In the Terminal (not in your agent):
```
openspec init
```

### Generate the spec

In your agent:
```
Create an openspec change to implement the functionality in `docs`. The playwright test suite `C:\Users\WouterVanRanst\repos\ae-eshopmodernizing\eShopModernizing\tests\catalog-functional-requirements.spec.ts`. Target architecture is .NET 10 ASP.NET Core Web API + Angular. The name of the new application is eShopModernized.
```

### Implement the spec

In your agent:

```
Implement the change
```

### Run it locally

Run these commands from the repository root in PowerShell:

```powershell
npm install
npm --prefix .\catalog-admin-ui install
dotnet build .\catalog-admin-api\CatalogAdmin.Api.csproj
npm --prefix .\catalog-admin-ui run build -- --configuration development
dotnet run --project .\catalog-admin-api\CatalogAdmin.Api.csproj --no-build --urls http://localhost:54001
```

Then open:

- `http://localhost:54001/catalog`

Stop the app with `Ctrl+C`.

### Running the Playwright suite against the modernized app

Use the `angular` Playwright project. Playwright will build and start the modernized app automatically.

```powershell
npx playwright test tests/catalog-functional-requirements.spec.ts --project angular --headed
```

## Run the Golden Master against both apps

For a slower demo run, set `PLAYWRIGHT_DEMO_DELAY_MS` to add a pause before each navigation and UI action:

```powershell
$env:PLAYWRIGHT_DEMO_DELAY_MS = '1000'
npx playwright test tests/catalog-functional-requirements.spec.ts --project webforms --headed
npx playwright test tests/catalog-functional-requirements.spec.ts --project angular --headed
```
