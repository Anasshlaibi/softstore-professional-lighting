/**
 * convert_mega_to_pdf.cjs
 *
 * Converts MEGA_MASTER_DOSSIER_AND_VALUATION.md into a beautifully styled HTML document
 * and exports it to MEGA_MASTER_DOSSIER_AND_VALUATION.pdf using headless Microsoft Edge / Chrome.
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

    if (line.startsWith('```')) {
      if (inCodeBlock) {
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

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      let cells = line.trim().slice(1, -1).split('|').map(c => c.trim());
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

    if (line.startsWith('# ')) {
      htmlLines.push(`<h1>${parseInline(line.slice(2))}</h1>`);
    } else if (line.startsWith('## ')) {
      htmlLines.push(`<h2 class="page-break-before">${parseInline(line.slice(3))}</h2>`);
    } else if (line.startsWith('### ')) {
      htmlLines.push(`<h3>${parseInline(line.slice(4))}</h3>`);
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

  if (inTable) htmlLines.push('</tbody></table></div>');

  return htmlLines.join('\n').replace(/<\/ul>\n<ul>/g, '\n').replace(/<\/ol>\n<ol>/g, '\n');
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
  <title>The Mega Master Dossier: E-Commerce Architecture & Commercial Valuation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    
    @page {
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.75;
      font-size: 13.5px;
      margin: 0;
      padding: 0;
    }

    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 8px;
      margin-top: 28px;
      margin-bottom: 16px;
      page-break-after: avoid;
    }

    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 32px;
      margin-bottom: 14px;
      page-break-after: avoid;
    }

    h2.page-break-before {
      page-break-before: always;
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2563eb;
      margin-top: 22px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }

    p { margin-top: 0; margin-bottom: 12px; }
    ul, ol { margin-top: 0; margin-bottom: 14px; padding-left: 22px; }
    li { margin-bottom: 6px; }

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
      padding: 16px;
      border-radius: 8px;
      font-size: 11px;
      line-height: 1.6;
      margin-top: 14px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    .table-wrapper {
      margin-top: 14px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }

    th {
      background-color: #0f172a;
      color: #ffffff;
      font-weight: 600;
      text-align: left;
      padding: 10px 12px;
      border: 1px solid #0f172a;
    }

    td {
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
    }

    tr:nth-child(even) td { background-color: #f8fafc; }

    blockquote, .alert {
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 0 6px 6px 0;
    }

    hr { border: 0; height: 1px; background: #cbd5e1; margin: 28px 0; }

    .header-box {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 32px;
      border-radius: 12px;
      margin-bottom: 32px;
    }

    .header-box h1 {
      color: #ffffff;
      border-bottom: none;
      margin: 0 0 10px 0;
      padding: 0;
      font-size: 28px;
    }

    .header-box p { color: #94a3b8; margin: 0; font-size: 14px; }

    .badge {
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="badge">Master Commercial Dossier & Technical Blueprint</div>
    <h1>SoftStore / GearShop Mega Master Dossier</h1>
    <p>360-Degree Comprehensive Master Presentation, SEO Case Study, Architecture & Valuation Playbook</p>
  </div>
  ${bodyHtml}
</body>
</html>`;
}

async function run() {
  const rootDir = path.join(__dirname, '..');
  const mdPath = path.join(rootDir, 'MEGA_MASTER_DOSSIER_AND_VALUATION.md');
  const htmlPath = path.join(rootDir, 'MEGA_MASTER_DOSSIER_AND_VALUATION.html');
  const pdfPath = path.join(rootDir, 'MEGA_MASTER_DOSSIER_AND_VALUATION.pdf');

  console.log('Reading MEGA_MASTER_DOSSIER_AND_VALUATION.md...');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  console.log('Converting Mega Dossier Markdown to HTML...');
  const bodyHtml = convertMarkdownToHtml(mdContent);
  const fullHtml = generateFullHtml(bodyHtml);

  fs.writeFileSync(htmlPath, fullHtml, 'utf8');

  const possiblePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  let browserPath = possiblePaths.find(p => fs.existsSync(p));
  if (!browserPath) {
    console.error('Browser not found.');
    process.exit(1);
  }

  console.log('Exporting Mega Master Dossier PDF using headless browser...');
  const cmd = `"${browserPath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n🎉 Mega Master Dossier PDF Successfully Generated!`);
    console.log(`   Location: ${pdfPath}`);
  } catch (err) {
    console.error('Failed to generate Mega Dossier PDF:', err.message);
    process.exit(1);
  }
}

run();
