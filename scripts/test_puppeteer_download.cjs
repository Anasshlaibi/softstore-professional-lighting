const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function testDownload() {
  console.log('Launching Chrome with anti-detection flags...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1280,800'
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  
  console.log('Navigating to https://saymonshop.com/ ...');
  await page.goto('https://saymonshop.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Wait for DDoS challenge to pass and main content to show
  console.log('Waiting for challenge to pass...');
  await page.waitForFunction(() => document.title !== 'LWS Protection DDoS - Vérification en cours' && !document.title.includes('DDoS'), { timeout: 15000 }).catch(() => {});
  
  console.log('Page Title:', await page.title());

  // Test downloading /images/eclairage16.webp
  const imgUrl = 'https://saymonshop.com/images/eclairage16.webp';
  const base64Data = await page.evaluate(async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
  }, imgUrl);

  const buffer = Buffer.from(base64Data, 'base64');
  console.log('Downloaded image size in bytes:', buffer.length);
  fs.writeFileSync('public/images/products/test_sk400.webp', buffer);
  console.log('Saved to public/images/products/test_sk400.webp');

  await browser.close();
}

testDownload().catch(console.error);
