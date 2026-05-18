'use strict';

const puppeteer = require('puppeteer-core');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
// Adjust these three constants for each repository.
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DOCS_DIR    = path.resolve(__dirname, '..', 'docs');     // source folder
const OUT_DIR     = path.resolve(__dirname, '..', 'docs-pdf'); // output folder
const MERMAID_JS  = path.resolve(__dirname, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #222;
    max-width: 900px;
    margin: 0 auto;
    padding: 0;
  }
  h1 { font-size: 20pt; border-bottom: 2px solid #2563eb; padding-bottom: 6px; margin-top: 0; color: #1e3a5f; }
  h2 { font-size: 15pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; color: #1e3a5f; }
  h3 { font-size: 12pt; color: #334155; }
  h4, h5, h6 { color: #475569; }
  a  { color: #2563eb; }
  code {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 3px;
    padding: 1px 4px;
    font-size: 9pt;
    font-family: 'Consolas', 'Courier New', monospace;
  }
  pre {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 12px;
    overflow-x: auto;
    font-size: 8.5pt;
    line-height: 1.45;
  }
  pre code { background: none; border: none; padding: 0; font-size: inherit; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 9.5pt;
  }
  th {
    background: #1e3a5f;
    color: #fff;
    padding: 6px 10px;
    text-align: left;
  }
  td { padding: 5px 10px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f8fafc; }
  blockquote {
    border-left: 4px solid #2563eb;
    margin: 0;
    padding: 4px 12px;
    color: #475569;
    background: #f0f4ff;
  }
  ul, ol { padding-left: 22px; }
  li { margin-bottom: 3px; }
  hr { border: none; border-top: 1px solid #cbd5e1; margin: 18px 0; }
  /* Mermaid rendered diagrams */
  .mermaid {
    margin: 16px 0;
    text-align: center;
  }
  .mermaid svg {
    max-width: 100%;
    height: auto;
  }
`;

// ── Utilities ─────────────────────────────────────────────────────────────────
function findMdFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findMdFiles(full));
    else if (entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

// marked renders mermaid fences as <pre><code class="language-mermaid">...
// Convert to <div class="mermaid"> so mermaid.js picks them up.
function convertMermaidBlocks(html) {
  return html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_, code) => `<div class="mermaid">${code}</div>`
  );
}

function buildHtml(markdown) {
  const body = convertMermaidBlocks(marked.parse(markdown));
  const hasMermaid = body.includes('class="mermaid"');
  return {
    html: `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>${CSS}</style>
</head><body>${body}</body></html>`,
    hasMermaid
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const files = findMdFiles(DOCS_DIR);
  console.log(`Found ${files.length} markdown files under docs/\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  let ok = 0, failed = 0;

  for (const file of files) {
    const rel     = path.relative(DOCS_DIR, file);
    const outPath = path.join(OUT_DIR, rel.replace(/\.md$/i, '.pdf'));

    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });

      const md = fs.readFileSync(file, 'utf8');
      const { html, hasMermaid } = buildHtml(md);

      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });

      if (hasMermaid) {
        // Inject mermaid.js from the local node_modules bundle — no internet required.
        await page.addScriptTag({ path: MERMAID_JS });
        await page.evaluate(async () => {
          window.mermaid.initialize({
            startOnLoad: false,
            theme: 'default',     // options: default | forest | dark | neutral
            securityLevel: 'loose'
          });
          await window.mermaid.run({ querySelector: '.mermaid' });
        });
      }

      await page.pdf({
        path:    outPath,
        format:  'A4',
        margin:  { top: '20mm', right: '18mm', bottom: '20mm', left: '18mm' },
        printBackground: true
      });

      console.log(`  ✓  ${rel}`);
      ok++;
    } catch (err) {
      console.error(`  ✗  ${rel}  →  ${err.message}`);
      failed++;
    }
  }

  await browser.close();

  console.log(`\nDone — ${ok} converted, ${failed} failed.`);
  console.log(`PDFs saved to: ${OUT_DIR}`);
})();
