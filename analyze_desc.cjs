const fs = require('fs');

const html = fs.readFileSync('C:/Downloaded Web Sites/7artisans.store/products/af-135mm-f1-8-full-frame-lens-for-e-z-l.html', 'utf8');

// The description is usually in an element with class containing "rte" or "description"
// Let's use a simple regex to find the start of the description wrapper.
// Shopify often uses <div class="product-single__description rte"> or similar.

const matches = [...html.matchAll(/<div[^>]*class=["'][^"']*(?:rte|description)[^"']*["'][^>]*>/ig)];

console.log(`Found ${matches.length} description wrappers.`);
matches.forEach((m, i) => {
  console.log(`${i}: ${m[0]}`);
  const index = m.index;
  const chunk = html.substring(index, index + 500);
  console.log(`Snippet:\n${chunk}\n---\n`);
});
