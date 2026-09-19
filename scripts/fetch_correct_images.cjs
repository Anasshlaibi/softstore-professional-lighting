const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function fetchCorrectImages() {
  console.log('Launching headless Chrome to fetch clean product assets...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  // Helper to fetch image data as base64 inside browser context
  async function downloadViaPage(url, savePath) {
    try {
      console.log(`Fetching ${url} ...`);
      const base64Data = await page.evaluate(async (imgUrl) => {
        const res = await fetch(imgUrl);
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }, url);

      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(savePath, buffer);
      console.log(`-> Successfully saved ${savePath} (${buffer.length} bytes)`);
      return true;
    } catch (err) {
      console.error(`Failed to download ${url}:`, err.message);
      return false;
    }
  }

  // 1. Sony Alpha 7 III Camera Body (Pure white background)
  await page.goto('https://www.sony.fr/electronics/appareils-photo-a-objectifs-interchangeables/ilce-7m3-body-kit', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  
  // High-res direct official assets
  const sonyA7IIIUrl = 'https://www.bhphotovideo.com/images/images500x500/1519643445_1394217.jpg';
  const pocketUrl = 'https://www.bhphotovideo.com/images/images500x500/1698227658_1791244.jpg'; // DJI Osmo Pocket 3 / 4 Pro official B&H
  const lens135Url = 'https://7artisans.store/cdn/shop/files/135-1_8_1.jpg'; // 7Artisans 135mm official

  console.log('Testing direct image downloads...');
  
  // Let's test loading pages or downloading images
  await browser.close();
}

fetchCorrectImages().catch(console.error);
