const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function searchSaymon() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  // Navigate to saymonshop
  await page.goto('https://saymonshop.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForFunction(() => !document.title.includes('DDoS'), { timeout: 15000 }).catch(() => {});

  async function searchAndGetImage(query) {
    console.log(`Searching for "${query}" ...`);
    await page.goto(`https://saymonshop.com/?s=${encodeURIComponent(query)}&post_type=product`, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
    
    // Extract first product image
    const imgData = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.product, .product-item, .product-grid-item, article'));
      for (const item of items) {
        const titleEl = item.querySelector('.product-title, .woocommerce-loop-product__title, h2, h3, a');
        const imgEl = item.querySelector('img');
        if (imgEl && imgEl.src) {
          return {
            title: titleEl ? titleEl.innerText.trim() : '',
            src: imgEl.getAttribute('data-src') || imgEl.src
          };
        }
      }
      return null;
    });

    console.log(`Result for "${query}":`, imgData);
    return imgData;
  }

  const a7 = await searchAndGetImage('Sony A7 III');
  const dji = await searchAndGetImage('Osmo Pocket');
  const l135 = await searchAndGetImage('135mm');

  await browser.close();
}

searchSaymon().catch(console.error);
