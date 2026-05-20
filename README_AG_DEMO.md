# PREP

```powershell
cd eShopLegacyWebFormsSolution

$vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
$vs = & $vswhere -latest -products * -property installationPath
$msbuild = Join-Path $vs 'MSBuild\Current\Bin\MSBuild.exe'

& $msbuild .\eShopLegacyWebForms.sln /t:Restore /p:RestorePackagesConfig=true /nologo
& $msbuild .\src\eShopLegacyWebForms\eShopLegacyWebForms.csproj /p:Configuration=Debug /p:VisualStudioVersion=18.0 /nologo
& 'C:\Program Files\IIS Express\iisexpress.exe' /path:"c:\Users\WouterVanRanst\repos\ae-eshopmodernizing\eShopModernizing\eShopLegacyWebFormsSolution\src\eShopLegacyWebForms" /port:50586
```

Browse to `http://localhost:50586/`


```powershell
npm --prefix .\catalog-admin-ui install
dotnet build .\catalog-admin-api\CatalogAdmin.Api.csproj
npm --prefix .\catalog-admin-ui run build -- --configuration development
dotnet run --project .\catalog-admin-api\CatalogAdmin.Api.csproj --no-build --urls http://localhost:54001
```



# SHOW LEGACY

`http://localhost:50586/`

# SHOW GOLDEN MASTER LEGACY

```powershell
$env:PLAYWRIGHT_DEMO_DELAY_MS = '500'
npx playwright test tests/goldenmaster.spec.ts --project webforms --headed
```

# SHOW MODERN

`http://localhost:54001/`

# SHOW GOLDEN MASTER MODERNIZED

```powershell
$env:PLAYWRIGHT_DEMO_DELAY_MS = '500'
npx playwright test tests/goldenmaster.spec.ts --project angular --headed
```
