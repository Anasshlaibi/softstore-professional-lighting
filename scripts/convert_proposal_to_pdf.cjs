/**
 * convert_proposal_to_pdf.cjs
 *
 * Converts CLIENT_PROPOSAL_AND_QUOTE.md into a beautifully styled HTML document
 * and exports it to CLIENT_PROPOSAL_AND_QUOTE.pdf using headless Microsoft Edge / Chrome.
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
      htmlLines.push(`<h2>${parseInline(line.slice(3))}</h2>`);
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
  <title>Commercial Development Proposal & Quote</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    
    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.5;
      font-size: 12px;
      margin: 0;
      padding: 0;
    }

    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 6px;
      margin-top: 20px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }

    h2 {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 14px;
      font-weight: 600;
      color: #2563eb;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }

    p { margin-top: 0; margin-bottom: 8px; }
    ul, ol { margin-top: 0; margin-bottom: 10px; padding-left: 18px; }
    li { margin-bottom: 3px; }

    code {
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 10px;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 2px 4px;
      border-radius: 4px;
    }

    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 10px;
      border-radius: 6px;
      font-size: 10px;
      line-height: 1.4;
      margin-top: 8px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }

    .table-wrapper {
      margin-top: 10px;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }

    th {
      background-color: #0f172a;
      color: #ffffff;
      font-weight: 600;
      text-align: left;
      padding: 7px 10px;
      border: 1px solid #0f172a;
    }

    td {
      padding: 7px 10px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
    }

    tr:nth-child(even) td { background-color: #f8fafc; }

    hr { border: 0; height: 1px; background: #e2e8f0; margin: 18px 0; }

    .header-box {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    .header-box h1 {
      color: #ffffff;
      border-bottom: none;
      margin: 0 0 6px 0;
      padding: 0;
      font-size: 22px;
    }

    .header-box p { color: #94a3b8; margin: 0; font-size: 12px; }

    .badge {
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 9999px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="badge">Commercial Development Proposal</div>
    <h1>SoftStore / GearShop E-Commerce Project Proposal</h1>
    <p>Itemized Scope of Work, Deliverable Timelines & Cost Estimate</p>
  </div>
  ${bodyHtml}
</body>
</html>`;
}

async function run() {
  const rootDir = path.join(__dirname, '..');
  const mdPath = path.join(rootDir, 'CLIENT_PROPOSAL_AND_QUOTE.md');
  const htmlPath = path.join(rootDir, 'CLIENT_PROPOSAL_AND_QUOTE.html');
  const pdfPath = path.join(rootDir, 'CLIENT_PROPOSAL_AND_QUOTE.pdf');

  console.log('Reading CLIENT_PROPOSAL_AND_QUOTE.md...');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  console.log('Converting Proposal Markdown to HTML...');
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

  console.log('Exporting Proposal PDF using headless browser...');
  const cmd = `"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n🎉 Client Proposal PDF Successfully Generated!`);
    console.log(`   Location: ${pdfPath}`);
  } catch (err) {
    console.error('Failed to generate proposal PDF:', err.message);
    process.exit(1);
  }
}

run();
