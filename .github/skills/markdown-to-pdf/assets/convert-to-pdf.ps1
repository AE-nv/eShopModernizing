# convert-to-pdf.ps1
# Converts all docs/**/*.md files to PDF using headless Chrome + puppeteer-core.
# PDFs are placed in docs-pdf/ mirroring the same folder structure.
#
# Usage:
#   .\convert-to-pdf.ps1
#
# Requirements:
#   - Node.js  (node.exe must be on PATH)
#   - Google Chrome installed at default location
#   - scripts/convert-to-pdf.js and scripts/package.json present

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot   = $PSScriptRoot
$scriptsDir = Join-Path $repoRoot 'scripts'

Write-Host "Installing dependencies..." -ForegroundColor Cyan
Push-Location $scriptsDir
try {
    & npm.cmd install --prefer-offline --no-audit --no-fund --loglevel error
    if ($LASTEXITCODE -ne 0) { throw "npm install failed (exit $LASTEXITCODE)" }

    Write-Host ""
    Write-Host "Converting markdown files to PDF..." -ForegroundColor Cyan
    & node convert-to-pdf.js
    if ($LASTEXITCODE -ne 0) { throw "Conversion script failed (exit $LASTEXITCODE)" }
} finally {
    Pop-Location
}
