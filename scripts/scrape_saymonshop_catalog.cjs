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

async function scrapeSaymonShop() {
  console.log('Fetching saymonshop.com sitemap...');
  const sitemapRes = await fetchUrl('https://saymonshop.com/sitemap.xml');
  console.log('Sitemap body length:', sitemapRes.body.length);

  // Extract all <loc> URLs
  const locs = (sitemapRes.body.match(/<loc>([^<]+)<\/loc>/g) || []).map(l => l.replace(/<\/?loc>/g, ''));
  console.log(`Found ${locs.length} URLs in sitemap.`);
  console.log(locs);

  // Check homepage for product links / images
  const home = await fetchUrl('https://saymonshop.com/');
  const imgUrls = [...new Set(home.body.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/gi) || [])];
  console.log(`Found ${imgUrls.length} images on saymonshop homepage:`);
  imgUrls.slice(0, 20).forEach(u => console.log('  ', u));
}

scrapeSaymonShop();
