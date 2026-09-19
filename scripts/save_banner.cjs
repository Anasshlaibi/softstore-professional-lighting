const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function convert() {
  if (!fs.existsSync('public/images/banners')) fs.mkdirSync('public/images/banners', { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const imgSrc = 'C:/Users/HELIOS NEO 16/.gemini/antigravity-ide/brain/6de65971-7420-4f73-8308-1d8f08bbe5fe/banner_bg_nikon_zr_1789775139178.jpg';
  const data = fs.readFileSync(imgSrc);
  const base64 = data.toString('base64');
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#000;display:flex;align-items:center;justify-content:center;width:1920px;height:720px;">
        <img id="img" src="data:image/jpeg;base64,${base64}" style="width:1920px;height:720px;object-fit:cover;" />
      </body>
    </html>
  `);
  
  await page.setViewport({ width: 1920, height: 720 });
  const el = await page.$('#img');
  await el.screenshot({ path: 'public/images/banners/banner_nikon.webp', type: 'webp', quality: 90 });
  console.log('✅ Created public/images/banners/banner_nikon.webp');
  await browser.close();
}

convert().catch(console.error);
