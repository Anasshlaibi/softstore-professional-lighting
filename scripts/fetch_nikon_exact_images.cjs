const puppeteer = require('puppeteer-core');
const fs = require('fs');
const https = require('https');
const http = require('http');

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          if (res.headers.location) return downloadImage(res.headers.location, dest).then(resolve);
          return resolve(false);
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
    } catch (e) {
      resolve(false);
    }
  });
}

async function fetchSpecificNikonImages() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--window-size=1280,800']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  const targets = [
    { query: 'Nikon ZR camera body official studio white background', file: 'public/images/products/nikon-zr.webp' },
    { query: 'Nikon Z6 III camera body official studio white background', file: 'public/images/products/nikon-z6-iii.webp' },
    { query: 'Nikon Z9 camera body official studio white background', file: 'public/images/products/nikon-z9.webp' },
    { query: 'Nikon Coolpix P950 official product white background', file: 'public/images/products/nikon-coolpix-p950.webp' }
  ];

  for (const t of targets) {
    console.log(`Searching for: ${t.query}`);
    const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(t.query)}&qft=+filterui:photo-photo`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });
    const urls = await page.evaluate(() => {
      const items = [];
      const els = document.querySelectorAll('a.iusc');
      for (const el of els) {
        try {
          const m = JSON.parse(el.getAttribute('m'));
          if (m && m.murl) items.push(m.murl);
        } catch(e) {}
      }
      return items;
    });

    for (const u of urls.slice(0, 5)) {
      const ok = await downloadImage(u, t.file);
      if (ok && fs.existsSync(t.file) && fs.statSync(t.file).size > 4000) {
        console.log(`✅ Saved ${t.file} (${Math.round(fs.statSync(t.file).size / 1024)} KB)`);
        break;
      }
    }
  }

  await browser.close();
}

fetchSpecificNikonImages().catch(console.error);
