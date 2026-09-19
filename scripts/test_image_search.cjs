const https = require('https');
const http = require('http');

async function searchImage(query) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`; // dummy test
    // Let's test standard image query
    const encoded = encodeURIComponent(`${query} official product`);
    const options = {
      hostname: 'html.duckduckgo.com',
      path: `/html/?q=${encoded}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const regex = /\/\/external-content\.duckduckgo\.com\/iu\/\?u=([^&"'\s]+)/g;
        const matches = [];
        let m;
        while ((m = regex.exec(data)) !== null) {
          try {
            const decoded = decodeURIComponent(m[1]);
            if (decoded.startsWith('http') && (decoded.endsWith('.jpg') || decoded.endsWith('.png') || decoded.endsWith('.webp') || decoded.includes('product') || decoded.includes('media'))) {
              matches.push(decoded);
            }
          } catch(e) {}
        }
        resolve(matches.slice(0, 3));
      });
    }).on('error', () => resolve([]));
  });
}

async function test() {
  const prods = [
    'Godox Tube TL120 RGB',
    'Canon Powershot V10',
    'Sony FX3A Cinema Line',
    'Hollyland Lark A1 Combo',
    'Vanguard VEO SELECT 55BT'
  ];

  for (const p of prods) {
    const imgs = await searchImage(p);
    console.log(p, '=>', imgs);
  }
}

test();
