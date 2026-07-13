const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const filePath = 'C:/Downloaded Web Sites/7artisans.store/products/af-135mm-f1-8-full-frame-lens-for-e-z-l.html';
const html = fs.readFileSync(filePath, 'utf8');
const $ = cheerio.load(html);

// Find the main section to get the title
const mainSection = $('[id$="__main"]');
const h1 = mainSection.find('h1').text().trim();
console.log(`Product Name: ${h1}`);

// Collect all sections between main and related-products (or collapsible-content)
let richHtml = '';
let started = false;

$('[id^="shopify-section-"]').each((i, el) => {
  const id = $(el).attr('id');
  if (id.includes('__related-products') || id.includes('__footer')) {
    started = false;
  }
  
  if (started) {
    richHtml += $(el).html();
  }

  if (id.endsWith('__main')) {
    started = true;
  }
});

console.log(`Extracted ${richHtml.length} bytes of rich HTML.`);

