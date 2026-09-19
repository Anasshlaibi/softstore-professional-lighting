const fs = require('fs');
const puppeteer = require('puppeteer-core');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  const logoB64 = fs.readFileSync('public/logo.png').toString('base64');
  const favB64 = fs.readFileSync('public/favicon-512x512.png').toString('base64');
  const gearB64 = fs.readFileSync('public/logo_gearshop.png').toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="background: #1e293b; color: white; font-family: sans-serif; padding: 20px;">
        <h2>Logo & Favicon Check</h2>
        <div style="display: flex; gap: 30px; margin-top: 20px;">
          <div>
            <h3>logo.png</h3>
            <div style="background: #0f172a; padding: 10px; border-radius: 8px;"><img src="data:image/png;base64,${logoB64}" style="width: 200px; height: 200px; object-fit: contain;" /></div>
          </div>
          <div>
            <h3>favicon-512x512.png</h3>
            <div style="background: #0f172a; padding: 10px; border-radius: 8px;"><img src="data:image/png;base64,${favB64}" style="width: 200px; height: 200px; object-fit: contain;" /></div>
          </div>
          <div>
            <h3>logo_gearshop.png</h3>
            <div style="background: #ffffff; padding: 10px; border-radius: 8px;"><img src="data:image/png;base64,${gearB64}" style="width: 200px; height: 200px; object-fit: contain;" /></div>
          </div>
        </div>
      </body>
    </html>
  `);

  await page.screenshot({ path: 'scratch_logo.png' });
  await browser.close();
  console.log('Saved scratch_logo.png');
}

run();
