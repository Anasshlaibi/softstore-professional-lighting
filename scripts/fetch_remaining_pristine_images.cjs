const puppeteer = require('puppeteer-core');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function simplifyQuery(name) {
  let q = name;
  q = q.replace(/Kit\s*\+\s*Objectif[^,]*/gi, '');
  q = q.replace(/\+\s*Objectif[^,]*/gi, '');
  q = q.replace(/\+\s*Etui[^,]*/gi, '');
  q = q.replace(/Trépied/gi, 'Tripod');
  q = q.replace(/Sac à Dos Photo/gi, 'Backpack');
  q = q.replace(/Sac Photo/gi, 'Bag');
  q = q.replace(/Camescope/gi, 'Camcorder');
  q = q.replace(/Support camera Mini/gi, 'Mini camera mount');
  q = q.replace(/Support Objectif Universal/gi, 'Lens support 15mm');
  q = q.replace(/Cage Protege Camera/gi, 'Camera Cage');
  q = q.replace(/Carte Mémoire/gi, 'Memory Card');
  q = q.replace(/Chargeur Batterie/gi, 'Battery Charger');
  q = q.replace(/Batterie Rechargeable/gi, 'Battery');
  q = q.replace(/Tube Lumineux Led Light/gi, 'Tube Light');
  q = q.replace(/Softbox Prabolique/gi, 'Parabolic Softbox');
  q = q.replace(/\bNoir\b|\bBleu\b|\bBlanc\b|\bRouge\b|\bVert\b|\bRose\b|\bMaron\b/gi, '');
  return `${q.trim()} official product white background`;
}

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          if (res.headers.location) {
            return downloadImage(res.headers.location, dest).then(resolve);
          }
          return resolve(false);
        }
        if (res.statusCode === 200) {
          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on('finish', () => file.close(() => resolve(true)));
        } else {
          resolve(false);
        }
      });
      req.on('error', () => resolve(false));
      req.setTimeout(8000, () => {
        req.abort();
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

async function searchBing(page, query) {
  const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qft=+filterui:photo-photo`;
  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });
    const imgUrls = await page.evaluate(() => {
      const items = [];
      const elements = document.querySelectorAll('a.iusc');
      for (const el of elements) {
        try {
          const m = JSON.parse(el.getAttribute('m'));
          if (m && m.murl && !m.murl.includes('facebook') && !m.murl.includes('instagram') && !m.murl.includes('youtube')) {
            items.push(m.murl);
          }
        } catch(e) {}
      }
      return items;
    });
    return imgUrls;
  } catch (err) {
    return [];
  }
}

async function main() {
  const { data: products } = await supabase.from('products gearshop').select('*');
  const missing = [];

  for (const p of products) {
    const slug = slugify(p.name);
    const targetFilename = `${slug}.webp`;
    const localDiskPath = `public/images/products/${targetFilename}`;
    if (!fs.existsSync(localDiskPath) || fs.statSync(localDiskPath).size < 3000) {
      missing.push(p);
    }
  }

  console.log(`Remaining missing products to download: ${missing.length}`);
  if (missing.length === 0) {
    console.log('All products already have clean high-res images!');
    return;
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--window-size=1280,800']
  });

  const CONCURRENCY = 4;
  const pages = await Promise.all(Array.from({ length: CONCURRENCY }, () => browser.newPage()));
  for (const p of pages) {
    await p.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  }

  let index = 0;
  let successCount = 0;

  async function worker(workerId, page) {
    while (index < missing.length) {
      const currentIdx = index++;
      const p = missing[currentIdx];
      const slug = slugify(p.name);
      const targetFilename = `${slug}.webp`;
      const localDiskPath = `public/images/products/${targetFilename}`;
      const localWebPath = `/images/products/${targetFilename}`;

      const cleanQ = simplifyQuery(p.name);
      console.log(`[W${workerId}] [${currentIdx + 1}/${missing.length}] ${cleanQ}`);
      const candidateUrls = await searchBing(page, cleanQ);

      let downloaded = false;
      for (const url of candidateUrls.slice(0, 8)) {
        const ok = await downloadImage(url, localDiskPath);
        if (ok && fs.existsSync(localDiskPath) && fs.statSync(localDiskPath).size > 3000) {
          downloaded = true;
          console.log(`✅ [W${workerId}] Saved ${targetFilename} (${Math.round(fs.statSync(localDiskPath).size / 1024)} KB)`);
          break;
        }
      }

      if (downloaded) {
        await supabase.from('products gearshop').update({
          image: localWebPath,
          gallery: [localWebPath]
        }).eq('id', p.id);
        successCount++;
      } else {
        // Fallback to generic product shot if needed
        console.warn(`⚠️ [W${workerId}] Failed: ${p.name}`);
      }
    }
  }

  await Promise.all(pages.map((p, idx) => worker(idx + 1, p)));
  await browser.close();

  console.log(`\n🎉 Downloaded ${successCount}/${missing.length} remaining images.`);
}

main().catch(console.error);
