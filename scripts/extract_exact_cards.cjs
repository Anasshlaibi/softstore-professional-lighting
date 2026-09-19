const fs = require('fs');

const htmlContent = fs.readFileSync('C:/Users/HELIOS NEO 16/Documents/softstore-professional-lighting-main/HTML FOR PICS.HTML', 'utf-8');

// Match <a> links and <img src> pairs inside product cards
const productCardRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][\s\S]*?<\/a>/gi;

const catalog = [];
let match;
while ((match = productCardRegex.exec(htmlContent)) !== null) {
  const link = match[1];
  const src = match[2];
  const alt = match[3];

  if (src && src.includes('wp-content/uploads') && !src.includes('logo') && !src.includes('banner')) {
    catalog.push({ link, src, alt });
  }
}

console.log(`Extracted ${catalog.length} linked product cards.`);
console.log('Sample product cards with exact model URLs:');
catalog.slice(0, 40).forEach((c, idx) => {
  console.log(`${idx + 1}. [${c.alt}] -> ${c.src}`);
  console.log(`   Link: ${c.link}`);
});
