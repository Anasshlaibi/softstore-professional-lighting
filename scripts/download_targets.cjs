const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function downloadTargets() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  async function fetchAndSave(url, saveRel) {
    try {
      console.log(`Downloading: ${url} ...`);
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const buffer = await response.buffer();
      const savePath = path.join(process.cwd(), 'public', saveRel);
      fs.writeFileSync(savePath, buffer);
      console.log(`✓ Saved ${saveRel} (${buffer.length} bytes)`);
      return true;
    } catch (e) {
      console.error(`✗ Error on ${url}:`, e.message);
      return false;
    }
  }

  // Let's search and download each item from reputable photography CDN sources (B&H / Saymonshop / Sony)
  // 1. Sony Alpha 7 III Body
  console.log('--- 1. Sony Alpha 7 III Body ---');
  // Navigate to B&H Sony a7 III page to get the high res photo
  await page.goto('https://www.bhphotovideo.com/c/product/1394217-REG/sony_ilce_7m3_b_alpha_a7_iii_mirrorless.html', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  let a7iiiImg = await page.evaluate(() => {
    const img = document.querySelector('img[data-selenium="inlineImage"], img[data-selenium="mainImage"]');
    return img ? img.src : null;
  });
  console.log('Found A7 III img:', a7iiiImg);
  if (a7iiiImg) {
    await fetchAndSave(a7iiiImg, 'images/products/sony-alpha-7-iii.webp');
  }

  // 2. 7Artisans 135mm F1.8 Lens
  console.log('--- 2. 7Artisans 135mm F1.8 ---');
  await page.goto('https://7artisans.store/products/7artisans-af-135mm-f1-8-full-frame-lens', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  let lensImg = await page.evaluate(() => {
    const img = document.querySelector('.product__media img, .product-single__photo');
    return img ? img.src : null;
  });
  console.log('Found 7Artisans 135mm img:', lensImg);
  if (lensImg) {
    await fetchAndSave(lensImg, 'images/products/af135mm-f1-8-sony-e-mount-black.webp');
    await fetchAndSave(lensImg, 'images/products/af135mm-f1-8-nikon-z-mount-black.webp');
    await fetchAndSave(lensImg, 'images/products/af135mm-f1-8-panasonic-leica-sigma-l-mount-black.webp');
  }

  // 3. DJI Osmo Pocket 3 / 4 Pro
  console.log('--- 3. DJI Osmo Pocket 3 / 4 Pro ---');
  await page.goto('https://www.bhphotovideo.com/c/product/1791244-REG/dji_cp_os_00000301_01_osmo_pocket_3.html', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  let pocketImg = await page.evaluate(() => {
    const img = document.querySelector('img[data-selenium="inlineImage"], img[data-selenium="mainImage"]');
    return img ? img.src : null;
  });
  console.log('Found DJI Pocket img:', pocketImg);
  if (pocketImg) {
    await fetchAndSave(pocketImg, 'images/products/dji-osmo-pocket-4-pro.webp');
    await fetchAndSave(pocketImg, 'images/products/dji-osmo-pocket-3-creator-combo.webp');
  }

  await browser.close();
}

downloadTargets().catch(console.error);
