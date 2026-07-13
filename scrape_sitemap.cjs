const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function fetchHtml(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch(e) {
    return null;
  }
}

function extractGalleryFromHtml(html) {
  if (!html) return [];
  const imgRegex = /<img[^>]+src="([^"]+cdn\/shop\/(?:files|products)\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/ig;
  const gallery = new Set();
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    let url = match[1];
    if (url.startsWith('//')) url = 'https:' + url;
    else if (url.startsWith('/cdn/')) url = 'https://7artisans.store' + url;
    if (!url.includes('favicon') && !url.includes('logo')) {
      gallery.add(url);
    }
  }
  return Array.from(gallery);
}

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
  const sitemap = await fetchHtml('https://7artisans.store/sitemap_products_1.xml');
  if (!sitemap) {
    console.log("Failed to fetch sitemap");
    return;
  }
  
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const productUrls = urls.filter(u => u.includes('/products/'));
  
  const { data: products } = await supabase.from('products gearshop').select('*');
  let missing = products.filter(p => {
    let g = p.gallery;
    if (typeof g === 'string') try { g = JSON.parse(g); } catch(e) {}
    return !g || !Array.isArray(g) || g.length === 0;
  });

  console.log(`Found ${productUrls.length} products in sitemap. Attempting to match ${missing.length} missing products...`);
  let updatedCount = 0;

  for (const p of missing) {
    const baseName = p.name.split(' Sony')[0].split(' Fuji')[0].split(' Nikon')[0].split(' Canon')[0].split(' Panasonic')[0].split(' M43')[0].replace('Autofocus adapter for', '').trim();
    const normBase = normalize(baseName);
    
    // Find best match in sitemap
    let matchUrl = null;
    for (const url of productUrls) {
      const handle = url.split('/').pop();
      const normHandle = normalize(handle.replace(/-/g, ''));
      if (normHandle.includes(normBase) || normBase.includes(normHandle)) {
        matchUrl = url;
        break;
      }
    }

    if (matchUrl) {
      console.log(`Matching [${p.name}] to ${matchUrl}`);
      const html = await fetchHtml(matchUrl);
      const gallery = extractGalleryFromHtml(html);
      if (gallery.length > 0) {
        await supabase.from('products gearshop').update({ gallery }).eq('id', p.id);
        updatedCount++;
        console.log(` -> Added ${gallery.length} images`);
      } else {
        console.log(` -> Matched but no images found`);
      }
    } else {
      console.log(`Could not find match in sitemap for: ${p.name}`);
    }
  }
  
  console.log(`\nSuccessfully scraped and updated ${updatedCount} products from sitemap.`);
}

run();
