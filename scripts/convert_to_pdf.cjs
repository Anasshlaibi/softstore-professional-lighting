/**
 * convert_to_pdf.cjs
 *
 * Converts MASTER_BLUEPRINT.md into a beautifully styled HTML document
 * and exports it to MASTER_BLUEPRINT.pdf using headless Microsoft Edge / Chrome.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function convertMarkdownToHtml(md) {
  let lines = md.split('\n');
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeContent = [];
  let htmlLines = [];
  let inTable = false;
  let tableHeaderDone = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        htmlLines.push(`<pre><code class="language-${codeBlockLang}">${escapeHtml(codeContent.join('\n'))}</code></pre>`);
        inCodeBlock = false;
        codeContent = [];
        codeBlockLang = '';
      } else {
        if (inTable) { htmlLines.push('</table></div>'); inTable = false; tableHeaderDone = false; }
        inCodeBlock = true;
        codeBlockLang = line.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      let cells = line.trim().slice(1, -1).split('|').map(c => c.trim());
      
      // Separator row
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        tableHeaderDone = true;
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaderDone = false;
        htmlLines.push('<div class="table-wrapper"><table>');
      }

      if (!tableHeaderDone) {
        htmlLines.push('<thead><tr>' + cells.map(c => `<th>${parseInline(c)}</th>`).join('') + '</tr></thead><tbody>');
      } else {
        htmlLines.push('<tr>' + cells.map(c => `<td>${parseInline(c)}</td>`).join('') + '</tr>');
      }
      continue;
    } else if (inTable) {
      htmlLines.push('</tbody></table></div>');
      inTable = false;
      tableHeaderDone = false;
    }

    // Headers
    if (line.startsWith('# ')) {
      htmlLines.push(`<h1>${parseInline(line.slice(2))}</h1>`);
    } else if (line.startsWith('## ')) {
      htmlLines.push(`<h2>${parseInline(line.slice(3))}</h2>`);
    } else if (line.startsWith('### ')) {
      htmlLines.push(`<h3>${parseInline(line.slice(4))}</h3>`);
    } else if (line.startsWith('#### ')) {
      htmlLines.push(`<h4>${parseInline(line.slice(5))}</h4>`);
    }
    // Blockquotes / Alerts
    else if (line.startsWith('> [!NOTE]') || line.startsWith('> [!IMPORTANT]') || line.startsWith('> [!WARNING]')) {
      let type = line.includes('IMPORTANT') ? 'important' : line.includes('WARNING') ? 'warning' : 'note';
      htmlLines.push(`<div class="alert alert-${type}">`);
    } else if (line.startsWith('> ')) {
      htmlLines.push(`<p>${parseInline(line.slice(2))}</p>`);
    } else if (line.startsWith('---')) {
      htmlLines.push('<hr />');
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      htmlLines.push(`<ul><li>${parseInline(line.slice(2))}</li></ul>`);
    } else if (/^\d+\.\s/.test(line)) {
      let text = line.replace(/^\d+\.\s/, '');
      htmlLines.push(`<ol><li>${parseInline(text)}</li></ol>`);
    } else if (line.trim() === '') {
      htmlLines.push('');
    } else {
      htmlLines.push(`<p>${parseInline(line)}</p>`);
    }
  }

  if (inTable) {
    htmlLines.push('</tbody></table></div>');
  }

  // Group adjacent <ul> and <ol>
  let result = htmlLines.join('\n')
    .replace(/<\/ul>\n<ul>/g, '\n')
    .replace(/<\/ol>\n<ol>/g, '\n');

  return result;
}

function parseInline(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function generateFullHtml(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>GearShop / SoftStore - Master Architecture Blueprint & Valuation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    
    @page {
      size: A4;
      margin: 18mm 15mm 18mm 15mm;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.6;
      font-size: 13px;
      margin: 0;
      padding: 0;
    }

    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 8px;
      margin-top: 24px;
      margin-bottom: 16px;
      page-break-after: avoid;
    }

    h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 22px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 15px;
      font-weight: 600;
      color: #2563eb;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    h4 {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }

    p {
      margin-top: 0;
      margin-bottom: 10px;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 12px;
      padding-left: 20px;
    }

    li {
      margin-bottom: 4px;
    }

    code {
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 11px;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 14px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 11px;
      line-height: 1.5;
      margin-top: 10px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }

    .table-wrapper {
      margin-top: 12px;
      margin-bottom: 16px;
      overflow-x: auto;
      page-break-inside: avoid;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    th {
      background-color: #f8fafc;
      color: #0f172a;
      font-weight: 600;
      text-align: left;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
    }

    td {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    blockquote, .alert {
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 10px 14px;
      margin: 14px 0;
      border-radius: 0 6px 6px 0;
    }

    .alert-important {
      background-color: #fef2f2;
      border-left-color: #ef4444;
      color: #991b1b;
    }

    .alert-warning {
      background-color: #fffbe6;
      border-left-color: #f59e0b;
      color: #b45309;
    }

    hr {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 24px 0;
    }

    a {
      color: #2563eb;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .header-box {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .header-box h1 {
      color: #ffffff;
      border-bottom: none;
      margin: 0 0 10px 0;
      padding: 0;
      font-size: 26px;
    }

    .header-box p {
      color: #94a3b8;
      margin: 0;
      font-size: 13px;
    }

    .badge {
      display: inline-block;
      background: #3b82f6;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="badge">Technical & Business Master Manual</div>
    <h1>GearShop / SoftStore Master Blueprint</h1>
    <p>Complete Architecture, Strategy, CRO, SEO, Database, Product Engineering & Commercial Valuation</p>
  </div>
  ${bodyHtml}
</body>
</html>`;
}

async function run() {
  const rootDir = path.join(__dirname, '..');
  const mdPath = path.join(rootDir, 'MASTER_BLUEPRINT.md');
  const htmlPath = path.join(rootDir, 'MASTER_BLUEPRINT.html');
  const pdfPath = path.join(rootDir, 'MASTER_BLUEPRINT.pdf');

  console.log('Reading MASTER_BLUEPRINT.md...');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  console.log('Converting Markdown to HTML...');
  const bodyHtml = convertMarkdownToHtml(mdContent);
  const fullHtml = generateFullHtml(bodyHtml);

  fs.writeFileSync(htmlPath, fullHtml, 'utf8');
  console.log(`Saved HTML to ${htmlPath}`);

  // Locate Microsoft Edge or Google Chrome executable
  const possiblePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  let browserPath = possiblePaths.find(p => fs.existsSync(p));

  if (!browserPath) {
    console.error('Neither Edge nor Chrome was found at standard locations.');
    process.exit(1);
  }

  console.log(`Using Browser: ${browserPath}`);
  console.log('Exporting PDF using headless browser...');

  const cmd = `"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n🎉 PDF Successfully Generated!`);
    console.log(`   Location: ${pdfPath}`);
  } catch (err) {
    console.error('Failed to generate PDF via browser:', err.message);
    process.exit(1);
  }
}

run();
