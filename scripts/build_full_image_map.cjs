const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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

async function main() {
  const { data: dbProducts, error } = await supabase.from('products gearshop').select('*');
  if (error) {
    console.error('Error fetching DB products:', error);
    return;
  }

  // Load Saymon products
  let saymonProducts = [];
  try {
    saymonProducts = JSON.parse(fs.readFileSync('scripts/saymon_products.json', 'utf8'));
  } catch (e) {
    console.warn('Could not load saymon_products.json:', e.message);
  }

  // Load Kamerty cards / products
  let kamertyProducts = [];
  try {
    kamertyProducts = JSON.parse(fs.readFileSync('scripts/kamerty_all_extracted.json', 'utf8'));
  } catch (e) {
    console.warn('Could not load kamerty_all_extracted.json:', e.message);
  }

  console.log(`Loaded ${dbProducts.length} DB products, ${saymonProducts.length} Saymon products, ${kamertyProducts.length} Kamerty products.`);

  const imageMap = [];
  const neededDownloads = [];

  for (const p of dbProducts) {
    const cleanSlug = slugify(p.name);
    const seoFilename = `${cleanSlug}.webp`;
    const localPath = `/images/products/${seoFilename}`;
    
    // Check if we already have this image downloaded locally
    const localDiskPath = `public/images/products/${seoFilename}`;
    const existsLocally = fs.existsSync(localDiskPath);

    let foundSource = null;
    let sourceOrigin = null;

    // 1. If currently pointing to Kamerty CDN
    if (p.image && p.image.includes('kamerty.ma')) {
      foundSource = p.image;
      sourceOrigin = 'kamerty';
    }

    // 2. Search in Saymon products for a better/alternate image
    const pNameLower = p.name.toLowerCase().replace(/[^a-z0-9]/g, ' ');
    const pWords = pNameLower.split(/\s+/).filter(w => w.length > 2);

    let bestSaymon = null;
    let bestSaymonScore = 0;

    for (const s of saymonProducts) {
      if (!s.image) continue;
      const sNameLower = s.name.toLowerCase().replace(/[^a-z0-9]/g, ' ');
      let matchCount = 0;
      for (const w of pWords) {
        if (sNameLower.includes(w)) matchCount++;
      }
      const score = matchCount / Math.max(pWords.length, 1);
      if (score > bestSaymonScore && score >= 0.6) {
        bestSaymonScore = score;
        bestSaymon = s;
      }
    }

    // 3. Search in Kamerty products
    let bestKamerty = null;
    let bestKamertyScore = 0;
    for (const k of kamertyProducts) {
      if (!k.image) continue;
      const kNameLower = k.title.toLowerCase().replace(/[^a-z0-9]/g, ' ');
      let matchCount = 0;
      for (const w of pWords) {
        if (kNameLower.includes(w)) matchCount++;
      }
      const score = matchCount / Math.max(pWords.length, 1);
      if (score > bestKamertyScore && score >= 0.6) {
        bestKamertyScore = score;
        bestKamerty = k;
      }
    }

    // Pick best available source
    if (!foundSource) {
      if (bestSaymon && bestSaymonScore >= 0.7) {
        foundSource = bestSaymon.image.startsWith('http') ? bestSaymon.image : `https://saymonshop.com${bestSaymon.image}`;
        sourceOrigin = 'saymon';
      } else if (bestKamerty && bestKamertyScore >= 0.6) {
        foundSource = bestKamerty.image;
        sourceOrigin = 'kamerty';
      } else if (p.image && !p.image.includes('unsplash.com')) {
        foundSource = p.image;
        sourceOrigin = 'existing';
      }
    }

    const item = {
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      currentImage: p.image,
      seoFilename,
      localPath,
      existsLocally,
      sourceUrl: foundSource,
      sourceOrigin,
      saymonMatch: bestSaymon ? { name: bestSaymon.name, image: bestSaymon.image, score: bestSaymonScore } : null,
      kamertyMatch: bestKamerty ? { name: bestKamerty.title, image: bestKamerty.image, score: bestKamertyScore } : null
    };

    imageMap.push(item);

    if (foundSource && (!existsLocally || p.image.includes('kamerty.ma') || p.image.includes('unsplash.com'))) {
      neededDownloads.push({
        id: p.id,
        name: p.name,
        sourceUrl: foundSource,
        sourceOrigin,
        targetFile: localDiskPath,
        localPath
      });
    }
  }

  fs.writeFileSync('scripts/catalog_image_map.json', JSON.stringify(imageMap, null, 2));
  fs.writeFileSync('scripts/needed_downloads.json', JSON.stringify(neededDownloads, null, 2));

  console.log(`Total catalog items mapped: ${imageMap.length}`);
  console.log(`Downloads needed: ${neededDownloads.length}`);

  const sourcesCount = {};
  imageMap.forEach(m => {
    sourcesCount[m.sourceOrigin || 'unmatched'] = (sourcesCount[m.sourceOrigin || 'unmatched'] || 0) + 1;
  });
  console.log('Sources breakdown:', sourcesCount);
}

main().catch(console.error);
