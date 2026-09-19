const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  const res = await fetchUrl('https://saymonshop.com/');
  console.log('Status:', res.status);
  fs.writeFileSync('scripts/saymon_home.html', res.body);
  console.log('Saved saymon_home.html, length:', res.body.length);
  
  // Look for script tags, api endpoints, etc.
  const scripts = [...res.body.matchAll(/<script[^>]*src=["']([^"']+)["']/g)].map(m => m[1]);
  console.log('Scripts found:', scripts);

  // Also check if there is a sitemap or robots.txt
  const robots = await fetchUrl('https://saymonshop.com/robots.txt');
  console.log('robots.txt:', robots.body);
  
  const sitemap = await fetchUrl('https://saymonshop.com/sitemap.xml');
  console.log('sitemap status:', sitemap.status, 'len:', sitemap.body.length);
  if (sitemap.body.length < 5000) {
    console.log('sitemap snippet:', sitemap.body.slice(0, 1000));
  }
}

main().catch(console.error);
