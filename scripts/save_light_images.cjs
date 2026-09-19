const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function convert() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const imgSrc = 'C:/Users/HELIOS NEO 16/.gemini/antigravity-ide/brain/6de65971-7420-4f73-8308-1d8f08bbe5fe/y300s_studio_light_1789775058284.jpg';
  const data = fs.readFileSync(imgSrc);
  const base64 = data.toString('base64');
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#ffffff;display:flex;align-items:center;justify-content:center;width:800px;height:800px;">
        <img id="img" src="data:image/jpeg;base64,${base64}" style="width:800px;height:800px;object-fit:contain;" />
      </body>
    </html>
  `);
  
  await page.setViewport({ width: 800, height: 800 });
  const el = await page.$('#img');
  
  await el.screenshot({ path: 'public/images/products/y300s.webp', type: 'webp', quality: 95 });
  await el.screenshot({ path: 'public/images/products/yb-300r.webp', type: 'webp', quality: 95 });
  await el.screenshot({ path: 'public/images/products/yb-100r.webp', type: 'webp', quality: 95 });
  
  console.log('✅ Successfully wrote y300s.webp, yb-300r.webp, yb-100r.webp');
  await browser.close();
}

convert().catch(console.error);
