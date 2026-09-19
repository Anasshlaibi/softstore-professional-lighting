const fs = require('fs');

// 1. Extract from Kamerty HTML
const kamertyHtml = fs.readFileSync('C:/Users/HELIOS NEO 16/Documents/softstore-professional-lighting-main/HTML FOR PICS.HTML', 'utf-8');

// Match any <img> tag with src and alt
const imgTagRegex = /<img[^>]+src=["'](https:\/\/kamerty\.ma\/wp-content\/uploads\/[^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi;
const kamertyImages = [];
let m;
while ((m = imgTagRegex.exec(kamertyHtml)) !== null) {
  const src = m[1];
  const alt = m[2] || '';
  if (!src.includes('logo') && !src.includes('icon') && !src.includes('banner')) {
    kamertyImages.push({
      image: src,
      title: alt.trim(),
      source: 'kamerty'
    });
  }
}

// Also match woocommerce cards
const cardRegex = /<li[^>]+class=["'][^"']*product[^"']*["'][\s\S]*?<\/li>/gi;
const titleRegex = /<h2[^>]*class=["'][^"']*woocommerce-loop-product__title[^"']*["'][^>]*>([^<]+)<\/h2>/i;
const cardImgRegex = /<img[^>]+src=["']([^"']+)["']/i;

const cards = kamertyHtml.match(cardRegex) || [];
cards.forEach(c => {
  const tMatch = c.match(titleRegex);
  const iMatch = c.match(cardImgRegex);
  if (tMatch && iMatch) {
    kamertyImages.push({
      image: iMatch[1],
      title: tMatch[1].trim(),
      source: 'kamerty'
    });
  }
});

console.log(`Extracted ${kamertyImages.length} images from Kamerty HTML.`);
fs.writeFileSync('scripts/kamerty_all_extracted.json', JSON.stringify(kamertyImages, null, 2));

// 2. Load Saymon products
const saymon = JSON.parse(fs.readFileSync('scripts/saymon_products.json', 'utf8'));
console.log(`Loaded ${saymon.length} products from Saymon.`);
