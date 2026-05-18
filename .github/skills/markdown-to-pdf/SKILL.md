---
name: markdown-to-pdf
description: "Batch-convert a folder of Markdown files to PDF using headless Chrome (puppeteer-core) and marked. Renders Mermaid diagrams as real SVG diagrams. No Pandoc or wkhtmltopdf required — only Node.js and Google Chrome. Use when: converting docs to PDF, exporting markdown, generating PDFs from documentation, markdown to PDF, batch PDF export."
---

# Markdown → PDF Skill

Converts an entire `docs/` tree of `.md` files to PDF, mirroring the folder structure under `docs-pdf/`. Mermaid code fences are rendered as proper SVG diagrams via a locally-injected `mermaid.min.js` bundle. Requires only **Node.js** and **Google Chrome** — no Pandoc, wkhtmltopdf, or internet access needed.

## When to Use

- User asks to convert markdown/docs to PDF
- User wants to export or share documentation as PDFs
- Any batch markdown → PDF export task

## Prerequisites

| Requirement | Check |
|-------------|-------|
| Node.js ≥ 18 | `node --version` |
| Google Chrome | Default: `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| `npm.cmd` accessible | `Get-Command npm.cmd` |

## Setup (first-time or new repository)

1. **Copy the three asset files** from this skill into a `scripts/` folder at the repo root:
   - `assets/convert-to-pdf.js` → `scripts/convert-to-pdf.js`
   - `assets/package.json` → `scripts/package.json`
   - `assets/convert-to-pdf.ps1` → `convert-to-pdf.ps1` (repo root)

2. **Adapt the config block** at the top of `convert-to-pdf.js` if needed:
   ```js
   const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
   const DOCS_DIR    = path.resolve(__dirname, '..', 'docs');   // source folder
   const OUT_DIR     = path.resolve(__dirname, '..', 'docs-pdf'); // output folder
   ```

3. **Install dependencies** (once; `node_modules` stays in `scripts/`):
   ```powershell
   cd scripts
   npm.cmd install
   ```

## Running

```powershell
# From repo root — installs deps if missing, then converts all .md files:
.\convert-to-pdf.ps1

# Or directly:
cd scripts
node convert-to-pdf.js
```

Output is placed in `docs-pdf/` mirroring the `docs/` folder structure.

## How It Works

1. `findMdFiles()` recursively collects all `.md` files under `DOCS_DIR`.
2. `marked.parse()` converts each file to HTML.
3. `convertMermaidBlocks()` replaces `<pre><code class="language-mermaid">` blocks with `<div class="mermaid">` so that mermaid.js can find them.
4. Puppeteer opens a single headless Chrome page and reuses it for all files (fast).
5. For files containing Mermaid diagrams, `mermaid.min.js` (local bundle in `node_modules`) is injected and `mermaid.run()` renders all SVGs before the PDF is captured.
6. `page.pdf()` exports A4 with 20/18 mm margins.

## Customisation Points

| What | Where | How |
|------|-------|-----|
| Page size / margins | `convert-to-pdf.js` → `page.pdf({...})` | Change `format`, `margin` |
| Source folder | `DOCS_DIR` constant | Point to any folder |
| Output folder | `OUT_DIR` constant | Any path |
| Mermaid theme | `mermaid.initialize({ theme: '...' })` | `default`, `forest`, `dark`, `neutral` |
| Chrome path | `CHROME_PATH` constant | Update for non-standard installs |
| Typography / colours | `CSS` constant | Edit inline CSS string |

## Known Limitations & Pitfalls

- **Mermaid diagrams must use standard fenced code blocks** (` ```mermaid `). Inline or non-standard syntax is not auto-detected.
- **Very large diagrams** may overflow the A4 page width — add `max-width` or scale via CSS if needed.
- **`networkidle0`** times out on large self-contained HTML pages; the script uses `domcontentloaded` instead.
- **npm.ps1 security prompt** — use `npm.cmd` instead of `npm` in PowerShell to bypass the Windows script execution warning.
- Add `docs-pdf/` and `scripts/node_modules/` to `.gitignore`.

## .gitignore Entries to Add

```gitignore
docs-pdf/
scripts/node_modules/
```

## Asset Files

See the `assets/` subfolder of this skill for the ready-to-copy scripts:

- [`assets/convert-to-pdf.js`](assets/convert-to-pdf.js) — main Node.js conversion script
- [`assets/package.json`](assets/package.json) — npm manifest with `marked`, `mermaid`, `puppeteer-core`
- [`assets/convert-to-pdf.ps1`](assets/convert-to-pdf.ps1) — one-click PowerShell runner
