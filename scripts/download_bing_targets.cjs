const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function downloadFromImageSearch() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  async function searchAndSave(searchQuery, relativeSavePath) {
    console.log(`Searching Bing Images for: "${searchQuery}" ...`);
    const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery + ' white background isolated')}&qft=+filterui:photo-photo+filterui:aspect-square`;
    await page.goto(bingUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));

    const imgUrls = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.iusc'));
      const urls = [];
      for (const link of links) {
        try {
          const m = JSON.parse(link.getAttribute('m') || '{}');
          if (m.murl && (m.murl.endsWith('.jpg') || m.murl.endsWith('.png') || m.murl.endsWith('.webp') || m.murl.includes('images'))) {
            urls.push(m.murl);
          }
        } catch (e) {}
      }
      return urls;
    });

    console.log(`Found ${imgUrls.length} candidate URLs for "${searchQuery}"`);
    if (imgUrls.length === 0) return false;

    // Try downloading the top candidate
    for (let i = 0; i < Math.min(5, imgUrls.length); i++) {
      const url = imgUrls[i];
      try {
        console.log(`Attempting candidate ${i+1}: ${url}`);
        const base64 = await page.evaluate(async (u) => {
          const res = await fetch(u);
          if (!res.ok) throw new Error('Fetch failed: ' + res.status);
          const blob = await res.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }, url);

        const buf = Buffer.from(base64, 'base64');
        if (buf.length > 5000) {
          const fullPath = path.join(process.cwd(), 'public', relativeSavePath);
          fs.writeFileSync(fullPath, buf);
          console.log(`✓ SUCCESS! Saved ${buf.length} bytes to ${relativeSavePath}`);
          return true;
        }
      } catch (err) {
        console.log(`Candidate ${i+1} failed (${err.message}), trying next...`);
      }
    }
    return false;
  }

  // 1. DJI Osmo Pocket 4 Pro / Osmo Pocket 3
  await searchAndSave('DJI Osmo Pocket 3 camera', 'images/products/dji-osmo-pocket-4-pro.webp');
  await searchAndSave('DJI Osmo Pocket 3 Creator Combo', 'images/products/dji-osmo-pocket-3-creator-combo.webp');

  // 2. Sony Alpha 7 III Camera Body
  await searchAndSave('Sony Alpha 7 III ILCE-7M3 camera body', 'images/products/sony-alpha-7-iii.webp');

  // 3. 7Artisans 135mm F1.8 Full Frame Lens
  await searchAndSave('7Artisans 135mm F1.8 lens', 'images/products/af135mm-f1-8-sony-e-mount-black.webp');
  await searchAndSave('7Artisans 135mm F1.8 lens', 'images/products/af135mm-f1-8-nikon-z-mount-black.webp');
  await searchAndSave('7Artisans 135mm F1.8 lens', 'images/products/af135mm-f1-8-panasonic-leica-sigma-l-mount-black.webp');

  // 4. Sony FX3 Cinema Line
  await searchAndSave('Sony FX3 Cinema Line camera body', 'images/products/sony-cinema-line-fx3.webp');
  await searchAndSave('Sony FX30 Cinema Line camera body', 'images/products/sony-cinema-line-fx30.webp');

  await browser.close();
}

downloadFromImageSearch().catch(console.error);
