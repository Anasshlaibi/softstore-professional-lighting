const puppeteer = require('puppeteer-core');
const fs = require('fs');
const https = require('https');
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

function cleanTokens(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !['pour', 'avec', 'sans', 'dans', 'noir', 'blanc', 'black', 'white', 'pack', 'bundle', 'kit'].includes(t));
}

function calculateSimilarity(tokensA, tokensB) {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  let matches = 0;
  for (const t of tokensA) {
    if (tokensB.includes(t)) matches++;
  }
  return matches / Math.max(tokensA.length, tokensB.length);
}

async function main() {
  console.log('--- Step 1: Loading Data Sources ---');
  const { data: dbProducts, error } = await supabase.from('products gearshop').select('*');
  if (error) {
    console.error('Supabase query error:', error);
    return;
  }
  console.log(`Loaded ${dbProducts.length} products from Supabase.`);

  const saymonProducts = JSON.parse(fs.readFileSync('scripts/saymon_products.json', 'utf8'));
  const kamertyProducts = JSON.parse(fs.readFileSync('scripts/kamerty_all_extracted.json', 'utf8'));
  console.log(`Loaded ${saymonProducts.length} Saymon products, ${kamertyProducts.length} Kamerty products.`);

  // Create public/images/products if not exists
  if (!fs.existsSync('public/images/products')) {
    fs.mkdirSync('public/images/products', { recursive: true });
  }

  // Build matching list
  const matchResults = [];
  const saymonDownloadQueue = [];

  for (const p of dbProducts) {
    const pTokens = cleanTokens(p.name);
    const pSlug = slugify(p.name);
    const targetFilename = `${pSlug}.webp`;
    const targetFilePath = `public/images/products/${targetFilename}`;
    const localDbPath = `/images/products/${targetFilename}`;

    let matchedSource = null;
    let matchType = null;
    let matchScore = 0;
    let matchedTitle = '';

    // 1. Try matching with Saymon products
    let bestSaymon = null;
    let bestSaymonScore = 0;
    for (const s of saymonProducts) {
      if (!s.image) continue;
      const sTokens = cleanTokens(s.name);
      const score = calculateSimilarity(pTokens, sTokens);
      if (score > bestSaymonScore) {
        bestSaymonScore = score;
        bestSaymon = s;
      }
    }

    // 2. Try matching with Kamerty products
    let bestKamerty = null;
    let bestKamertyScore = 0;
    for (const k of kamertyProducts) {
      if (!k.image || k.image.includes('logo') || k.image.includes('banner')) continue;
      const kTokens = cleanTokens(k.title);
      const score = calculateSimilarity(pTokens, kTokens);
      if (score > bestKamertyScore) {
        bestKamertyScore = score;
        bestKamerty = k;
      }
    }

    if (bestSaymon && bestSaymonScore >= 0.45) {
      matchedSource = bestSaymon.image.startsWith('http') ? bestSaymon.image : `https://saymonshop.com${bestSaymon.image}`;
      matchType = 'saymon';
      matchScore = bestSaymonScore;
      matchedTitle = bestSaymon.name;
    } else if (bestKamerty && bestKamertyScore >= 0.4) {
      matchedSource = bestKamerty.image;
      matchType = 'kamerty';
      matchScore = bestKamertyScore;
      matchedTitle = bestKamerty.title;
    } else if (bestSaymon && bestSaymonScore >= 0.3) {
      matchedSource = bestSaymon.image.startsWith('http') ? bestSaymon.image : `https://saymonshop.com${bestSaymon.image}`;
      matchType = 'saymon_fuzzy';
      matchScore = bestSaymonScore;
      matchedTitle = bestSaymon.name;
    }

    matchResults.push({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      currentImage: p.image,
      matchedSource,
      matchType,
      matchScore,
      matchedTitle,
      targetFilename,
      targetFilePath,
      localDbPath
    });

    if (matchedSource && matchedSource.includes('saymonshop.com')) {
      saymonDownloadQueue.push({
        id: p.id,
        name: p.name,
        sourceUrl: matchedSource,
        targetFilePath,
        localDbPath
      });
    }
  }

  console.log(`Matched ${matchResults.filter(m => m.matchedSource).length} of ${matchResults.length} catalog products!`);
  console.log(`Saymon downloads queued: ${saymonDownloadQueue.length}`);

  fs.writeFileSync('scripts/catalog_match_results.json', JSON.stringify(matchResults, null, 2));

  // --- Step 2: Download Saymon Images via Chrome ---
  console.log('--- Step 2: Launching Chrome to download Saymon images ---');
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
  
  console.log('Navigating to SaymonShop to authenticate session...');
  await page.goto('https://saymonshop.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForFunction(() => !document.title.includes('DDoS'), { timeout: 15000 }).catch(() => {});
  console.log('SaymonShop session active! Starting batch image extraction...');

  // Extract all images in parallel inside page context
  const uniqueUrls = [...new Set(saymonDownloadQueue.map(item => item.sourceUrl))];
  console.log(`Total unique Saymon image URLs to download: ${uniqueUrls.length}`);

  const downloadedData = await page.evaluate(async (urls) => {
    const results = {};
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const blob = await res.blob();
          const b64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
          });
          results[url] = { ok: true, data: b64 };
        } else {
          results[url] = { ok: false, status: res.status };
        }
      } catch (err) {
        results[url] = { ok: false, error: err.message };
      }
    }
    return results;
  }, uniqueUrls);

  await browser.close();
  console.log('Chrome closed. Saving downloaded images to disk...');

  let savedCount = 0;
  for (const item of saymonDownloadQueue) {
    const res = downloadedData[item.sourceUrl];
    if (res && res.ok && res.data) {
      const buffer = Buffer.from(res.data, 'base64');
      fs.writeFileSync(item.targetFilePath, buffer);
      savedCount++;
    }
  }
  console.log(`Successfully saved ${savedCount} local SEO images to public/images/products/`);

  // --- Step 3: Update Supabase Products with Clean SEO URLs & Metadata ---
  console.log('--- Step 3: Updating Supabase Catalog with Clean SEO Data ---');
  let updatedInDb = 0;

  for (const item of matchResults) {
    if (fs.existsSync(item.targetFilePath)) {
      // Build clean SEO metadata
      const cleanTitle = `${item.name} | GearShop Maroc`.slice(0, 60);
      const cleanMetaDesc = `Achetez ${item.name} au meilleur prix au Maroc chez GearShop. Garantie officielle, livraison rapide à Casablanca, Rabat, Marrakech et partout au Maroc.`.slice(0, 155);

      const { error: updateErr } = await supabase
        .from('products gearshop')
        .update({
          image: item.localDbPath,
          gallery: [item.localDbPath],
          seo_title: cleanTitle,
          meta_description: cleanMetaDesc
        })
        .eq('id', item.id);

      if (!updateErr) {
        updatedInDb++;
      } else {
        console.warn(`Error updating product ${item.id}:`, updateErr.message);
      }
    }
  }

  console.log(`Updated ${updatedInDb} products in Supabase with clean local SEO images!`);
}

main().catch(console.error);
