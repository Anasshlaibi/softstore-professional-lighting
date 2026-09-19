const puppeteer = require('puppeteer-core');
const fs = require('fs');
const https = require('https');
const http = require('http');

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(true)));
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.setTimeout(8000, () => {
      req.abort();
      resolve(false);
    });
  });
}

async function testBHSearch() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  const testProducts = [
    'Sony Alpha 7 IV',
    'Canon EOS R6 Mark II',
    'Nikon Z fc',
    'Godox V1',
    'DJI Osmo Pocket 3',
    'Smallrig Mini Matte Box Lite',
    'Vanguard Trépied VESTA 233AP',
    'Insta360 Ace Pro'
  ];

  for (const name of testProducts) {
    console.log(`\nSearching B&H style studio photo for: ${name}`);
    const query = `${name} bhphoto official product studio white background`;
    const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qft=+filterui:photo-photo`;
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const imgCandidates = await page.evaluate(() => {
      const links = [];
      const els = document.querySelectorAll('a.iusc');
      for (const el of els) {
        try {
          const m = JSON.parse(el.getAttribute('m'));
          if (m && m.murl) {
            // prioritize bhphoto, amazon, adorama, official brand cdns
            links.push({
              url: m.murl,
              title: m.t || '',
              source: m.purl || ''
            });
          }
        } catch(e) {}
      }
      return links;
    });

    console.log(`Found ${imgCandidates.length} candidate images.`);
    if (imgCandidates.length > 0) {
      console.log('Top match:', imgCandidates[0]);
    }
  }

  await browser.close();
}

testBHSearch().catch(console.error);
