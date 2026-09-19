const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const https = require('https');
const http = require('http');

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

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://kamerty.ma/'
      }
    }, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(true)));
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.setTimeout(10000, () => {
      req.abort();
      resolve(false);
    });
  });
}

async function run() {
  console.log('--- Step 1: Fetching All Products from Supabase ---');
  const { data: products, error } = await supabase.from('products gearshop').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  console.log(`Total products in catalog: ${products.length}`);

  const saymonProducts = JSON.parse(fs.readFileSync('scripts/saymon_products.json', 'utf8'));
  const kamertyProducts = JSON.parse(fs.readFileSync('scripts/kamerty_all_extracted.json', 'utf8'));

  let updatedCount = 0;
  const missingList = [];

  for (const p of products) {
    const cleanSlug = slugify(p.name);
    const targetFilename = `${cleanSlug}.webp`;
    const localDiskPath = `public/images/products/${targetFilename}`;
    const localWebPath = `/images/products/${targetFilename}`;

    let imageReady = false;

    // Check if local file already exists and is valid (> 1KB)
    if (fs.existsSync(localDiskPath) && fs.statSync(localDiskPath).size > 1000) {
      imageReady = true;
    } else {
      // Try to find a source to download
      let sourceUrl = null;

      // 1. If currently pointing to Kamerty CDN
      if (p.image && p.image.includes('kamerty.ma')) {
        sourceUrl = p.image;
      }

      // 2. Search in Kamerty list
      if (!sourceUrl) {
        const pTokens = cleanSlug.split('-');
        let bestK = null;
        let bestKScore = 0;
        for (const k of kamertyProducts) {
          if (!k.image || k.image.includes('logo') || k.image.includes('banner')) continue;
          const kSlug = slugify(k.title);
          let match = 0;
          for (const t of pTokens) {
            if (t.length > 2 && kSlug.includes(t)) match++;
          }
          const score = match / Math.max(pTokens.length, 1);
          if (score > bestKScore && score >= 0.4) {
            bestKScore = score;
            bestK = k;
          }
        }
        if (bestK) sourceUrl = bestK.image;
      }

      if (sourceUrl) {
        const ok = await downloadFile(sourceUrl, localDiskPath);
        if (ok && fs.statSync(localDiskPath).size > 1000) {
          imageReady = true;
          console.log(`[Downloaded] ${p.name} -> ${targetFilename}`);
        }
      }
    }

    if (imageReady) {
      // Update DB if image was pointing to external URL or old format
      if (p.image !== localWebPath) {
        const { error: updateErr } = await supabase
          .from('products gearshop')
          .update({
            image: localWebPath,
            gallery: [localWebPath]
          })
          .eq('id', p.id);

        if (!updateErr) {
          updatedCount++;
        }
      }
    } else {
      missingList.push({ id: p.id, name: p.name, category: p.category, brand: p.brand });
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Successfully updated ${updatedCount} products to clean local SEO images.`);
  console.log(`Products still needing an image: ${missingList.length}`);
  if (missingList.length > 0) {
    console.log('Sample missing products:');
    console.log(missingList.slice(0, 20));
  }
}

run().catch(console.error);
