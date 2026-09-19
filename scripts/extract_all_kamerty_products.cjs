const fs = require('fs');

const html = fs.readFileSync('C:/Users/HELIOS NEO 16/Documents/softstore-professional-lighting-main/HTML FOR PICS.HTML', 'utf-8');

// Match all product links and image sources
const prodRegex = /<li[^>]+class=["'][^"']*product[^"']*["'][\s\S]*?<\/li>/gi;
const linkRegex = /href=["'](https:\/\/kamerty\.ma\/produit\/[^"']+)["']/i;
const titleRegex = /<h2[^>]*class=["'][^"']*woocommerce-loop-product__title[^"']*["'][^>]*>([^<]+)<\/h2>/i;
const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["']/i;

const cards = html.match(prodRegex) || [];
console.log(`Found ${cards.length} product list cards in HTML.`);

const extracted = [];
cards.forEach(card => {
  const lMatch = card.match(linkRegex);
  const tMatch = card.match(titleRegex);
  const iMatch = card.match(imgRegex);

  if (iMatch && iMatch[1]) {
    extracted.push({
      title: tMatch ? tMatch[1].trim() : '',
      url: lMatch ? lMatch[1] : '',
      image: iMatch[1],
      alt: iMatch[2] || ''
    });
  }
});

console.log(`Extracted ${extracted.length} valid product items.`);
extracted.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.title}]`);
  console.log(`   Img: ${p.image}`);
});
