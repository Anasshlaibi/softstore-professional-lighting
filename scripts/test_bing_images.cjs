const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function searchBingImages(page, query) {
  const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qft=+filterui:photo-photo+filterui:aspect-square`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  
  const imgUrls = await page.evaluate(() => {
    const items = [];
    const elements = document.querySelectorAll('a.iusc');
    for (const el of elements) {
      try {
        const m = JSON.parse(el.getAttribute('m'));
        if (m && m.murl && (m.murl.endsWith('.jpg') || m.murl.endsWith('.png') || m.murl.endsWith('.webp') || m.murl.includes('bhphoto') || m.murl.includes('amazon') || m.murl.includes('sony') || m.murl.includes('canon') || m.murl.includes('nikon'))) {
          items.push({
            imgUrl: m.murl,
            title: m.t || '',
            desc: m.desc || ''
          });
        }
      } catch(e) {}
    }
    return items;
  });
  return imgUrls;
}

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--window-size=1280,800']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  console.log('Searching for pristine Sony Alpha 7 IV studio shot...');
  const results = await searchBingImages(page, 'Sony Alpha 7 IV official product white background bhphoto');
  console.log('Found image results:', results.length);
  if (results.length > 0) {
    console.log('Top 3 pristine images:');
    results.slice(0, 3).forEach(r => console.log('Image URL:', r.imgUrl, '\nTitle:', r.title, '\n'));
  }

  await browser.close();
}

test().catch(console.error);
