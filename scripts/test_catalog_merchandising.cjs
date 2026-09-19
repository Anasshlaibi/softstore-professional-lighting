const fs = require('fs');
const puppeteer = require('puppeteer-core');

async function testBrowserView() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await page.waitForSelector('img[alt]', { timeout: 10000 });

  const prods = await page.evaluate(() => {
    // Select product cards
    const cards = Array.from(document.querySelectorAll('.group.relative, [data-product-card], a[href*="/product/"]'));
    return cards.map(c => {
      const title = c.querySelector('h2, h3, h4, p.font-bold, p.font-semibold, .line-clamp-2')?.textContent?.trim();
      const price = c.querySelector('.text-red-600, .font-extrabold, .text-xl, .text-lg')?.textContent?.trim();
      return { title, price };
    }).filter(x => x.title && x.price);
  });

  console.log('Homepage first 10 products:');
  console.log(prods.slice(0, 10));

  await page.goto('http://localhost:5173/?category=Objectifs', { waitUntil: 'networkidle2' });
  await page.waitForSelector('img[alt]', { timeout: 10000 });

  const lensProds = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.group.relative, [data-product-card], a[href*="/product/"]'));
    return cards.map(c => {
      const title = c.querySelector('h2, h3, h4, p.font-bold, p.font-semibold, .line-clamp-2')?.textContent?.trim();
      const price = c.querySelector('.text-red-600, .font-extrabold, .text-xl, .text-lg')?.textContent?.trim();
      return { title, price };
    }).filter(x => x.title && x.price);
  });

  console.log('Objectifs category first 10 products:');
  console.log(lensProds.slice(0, 10));

  await browser.close();
}

testBrowserView()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
