const https = require('https');
const fs = require('fs');

function fetchChunk(name) {
  return new Promise((resolve) => {
    https.get('https://saymonshop.com/' + name, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ name, status: res.statusCode, len: data.length, body: data }));
    });
  });
}

async function main() {
  const chunks = ['assets/products-PiUAE8-_.js', 'assets/api-DX9peAjV.js', 'assets/useAdminProducts-BF3k0itc.js', 'assets/Catalog-BCfHfVv0.js'];
  for (const c of chunks) {
    const res = await fetchChunk(c);
    console.log(res.name, res.status, res.len);
    fs.writeFileSync('scripts/' + res.name.replace('assets/', 'saymon_'), res.body);
    
    // Look for URLs, endpoints, backend-php, etc.
    const urls = [...res.body.matchAll(/https?:\/\/[^\s"'`]+/g)].map(m => m[0]);
    console.log('URLs in', res.name, urls.slice(0, 5));
    
    const endpoints = [...res.body.matchAll(/["'](\/(?:backend-php|api|assets|images)[^"']+)["']/g)].map(m => m[1]);
    console.log('Endpoints in', res.name, [...new Set(endpoints)]);
  }
}
main();
