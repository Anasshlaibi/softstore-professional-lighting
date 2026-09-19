const https = require('https');
const fs = require('fs');

function fetchText(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36', ...headers } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function searchDDGImages(query) {
  try {
    const html = await fetchText('https://duckduckgo.com/?q=' + encodeURIComponent(query));
    const match = html.match(/vqd=["']?([0-9-]+)["']?/) || html.match(/vqd=([0-9-]+)/);
    if (!match) {
      // Fallback regex
      const match2 = html.match(/vqd=["']([^"']+)["']/);
      if (!match2) return [];
      var vqd = match2[1];
    } else {
      var vqd = match[1];
    }

    const apiUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,&p=1`;
    const jsonStr = await fetchText(apiUrl, { 'Referer': 'https://duckduckgo.com/' });
    const json = JSON.parse(jsonStr);
    return json.results || [];
  } catch (err) {
    console.error('DDG error:', err.message);
    return [];
  }
}

async function run() {
  console.log('Searching for official studio photos...');
  const tests = [
    'Sony Alpha 7 IV camera white background official',
    'Canon EOS R6 Mark II camera white background official',
    'Nikon Z fc camera official studio white background',
    'Godox V1 Flash official pure white background',
    'DJI Osmo Pocket 3 Creator Combo official product'
  ];

  for (const q of tests) {
    console.log(`\nQuery: ${q}`);
    const results = await searchDDGImages(q);
    console.log(`Found ${results.length} images.`);
    if (results.length > 0) {
      console.log('1st match:', results[0].image, '| Title:', results[0].title);
      console.log('2nd match:', results[1]?.image, '| Title:', results[1]?.title);
    }
  }
}

run();
