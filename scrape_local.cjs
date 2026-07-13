const fs = require('fs');
const path = require('path');

const folder = 'C:/Downloaded Web Sites/7artisans.store/products';
const htmlFiles = fs.readdirSync(folder).filter(f => f.endsWith('.html'));

const products = [];

for (const file of htmlFiles) {
  const filePath = path.join(folder, file);
  const html = fs.readFileSync(filePath, 'utf8');

  // Find the title
  const titleMatch = html.match(/<title>\s*(.*?)\s*&ndash;/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract all images
  const regex = /["']([^"']*?\/cdn\/shop\/files\/[^"']*?\.(?:jpg|png|webp|jpeg)(?:\?v=\d+(?:&width=\d+)?|\?v=\d+)?)["']/ig;
  const matches = [...html.matchAll(regex)];
  let urls = [...new Set(matches.map(m => m[1]))];

  // Clean URLs:
  urls = urls.map(u => {
    if (u.startsWith('../')) return u.replace('../', 'https://7artisans.store/');
    if (u.startsWith('//')) return 'https:' + u;
    if (u.startsWith('http')) return u;
    return 'https://7artisans.store' + (u.startsWith('/') ? '' : '/') + u;
  });
  
  // Filter for actual product images, exclude small crops or icons
  urls = urls.filter(u => !u.includes('crop=center') && !u.includes('width=32'));

  // Unique again
  urls = [...new Set(urls)];

  if (title) {
    products.push({ file, title, images: urls.length, sample: urls.slice(0, 3) });
  }
}

console.log(`Parsed ${products.length} products`);
console.log(products.find(p => p.file.includes('135mm')));
