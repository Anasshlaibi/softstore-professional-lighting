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
  const bundle = await fetchUrl('https://saymonshop.com/assets/index-DAv4knGh.js');
  console.log('Bundle status:', bundle.status, 'len:', bundle.body.length);
  fs.writeFileSync('scripts/saymon_bundle.js', bundle.body);

  const chunkMatches = [...bundle.body.matchAll(/assets\/[a-zA-Z0-9_\-\.]+\.js/g)].map(m => m[0]);
  console.log('Other chunks:', [...new Set(chunkMatches)]);

  // Let's also check all .json or .php or /api/ references
  const endpoints = [...bundle.body.matchAll(/["'](\/(?:api|backend-php|data|assets)[^"']+)["']/g)].map(m => m[1]);
  console.log('Sample endpoints:', [...new Set(endpoints)].slice(0, 30));

  // Let's also search for product data or supabase / firebase / mock products
  const supabaseMatches = [...bundle.body.matchAll(/https:\/\/[a-z0-9-]+\.supabase\.co[^\s"']*/g)].map(m => m[0]);
  console.log('Supabase matches:', [...new Set(supabaseMatches)]);
}

main().catch(console.error);
