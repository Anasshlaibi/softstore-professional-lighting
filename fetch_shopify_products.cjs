const fs = require('fs');

async function run() {
  let allProducts = [];
  let page = 1;
  while (true) {
    const res = await fetch(`https://7artisans.store/products.json?limit=250&page=${page}`);
    if (!res.ok) {
      console.log('Failed to fetch page', page);
      break;
    }
    const data = await res.json();
    if (data.products.length === 0) break;
    allProducts.push(...data.products);
    page++;
  }
  
  fs.writeFileSync('all_shopify_products.json', JSON.stringify(allProducts, null, 2));
  console.log(`Fetched ${allProducts.length} products from Shopify.`);
}

run().catch(console.error);
