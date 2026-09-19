const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

const CATALOG_URLS = [
  'https://saymonshop.com/catalog/camera',
  'https://saymonshop.com/catalog/camera/sony',
  'https://saymonshop.com/catalog/camera/canon',
  'https://saymonshop.com/catalog/camera/nikon',
  'https://saymonshop.com/catalog/objectifs',
  'https://saymonshop.com/catalog/objectifs/sony',
  'https://saymonshop.com/catalog/objectifs/canon',
  'https://saymonshop.com/catalog/objectifs/nikon',
  'https://saymonshop.com/catalog/stabilisateur',
  'https://saymonshop.com/catalog/accessoires/flash-et-eclairage',
  'https://saymonshop.com/catalog/son-et-audio',
  'https://saymonshop.com/catalog/trepied',
  'https://saymonshop.com/catalog/accessoires',
  'https://saymonshop.com/catalog/accessoires/cartes-memoires-lexar',
];

async function crawlSaymon() {
  console.log('Crawling all SaymonShop catalog pages...');
  const allProducts = [];

  for (const catUrl of CATALOG_URLS) {
    try {
      console.log(`Fetching ${catUrl}...`);
      const res = await fetchUrl(catUrl);
      
      // Extract product cards / images
      // Check HTML structure on saymonshop
      const imgMatches = [...res.body.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["']/gi)];
      console.log(`  Found ${imgMatches.length} images on ${catUrl}`);
      
      imgMatches.forEach(m => {
        const src = m[1];
        const alt = m[2];
        if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('banner')) {
          const fullSrc = src.startsWith('http') ? src : `https://saymonshop.com${src.startsWith('/') ? '' : '/'}${src}`;
          allProducts.push({
            url: catUrl,
            image: fullSrc,
            alt: alt.trim()
          });
        }
      });
    } catch (err) {
      console.error(`Error crawling ${catUrl}:`, err.message);
    }
  }

  console.log(`\nExtracted total ${allProducts.length} product images from SaymonShop.`);
  fs.writeFileSync('saymonshop_scraped.json', JSON.stringify(allProducts, null, 2));
  console.log('Saved to saymonshop_scraped.json');
}

crawlSaymon();
