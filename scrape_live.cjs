const { createClient } = require('@supabase/supabase-js');
const https = require('https');

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

// Generate possible handle from name
function getHandle(name) {
  let baseName = name.split(' Sony')[0].split(' Fuji')[0].split(' Nikon')[0].split(' Canon')[0].split(' Panasonic')[0].split(' M43')[0].trim().toLowerCase();
  return baseName.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function run() {
  const { data: products } = await supabase.from('products gearshop').select('*');
  let missing = [];

  for (const p of products) {
    let gallery = p.gallery;
    if (typeof gallery === 'string') {
      try { gallery = JSON.parse(gallery); } catch(e) {}
    }
    if (!gallery || !Array.isArray(gallery) || gallery.length === 0) {
      missing.push(p);
    }
  }

  console.log(`Attempting to scrape ${missing.length} missing products from live site...`);
  
  let updatedCount = 0;
  for (const p of missing) {
    const handle = getHandle(p.name);
    let html = null;
    
    // Try exact handle
    html = await fetchHtml(`https://7artisans.store/products/${handle}`);
    
    // Fallbacks if not found (404)
    if (!html || html.includes('404 Page Not Found')) {
       // try prepending 7artisans
       html = await fetchHtml(`https://7artisans.store/products/7artisans-${handle}`);
    }

    if (html && !html.includes('404 Page Not Found')) {
      const gallery = extractGalleryFromHtml(html);
      if (gallery.length > 0) {
        console.log(`Scraped ${gallery.length} images for ${p.name}`);
        await supabase.from('products gearshop').update({ gallery }).eq('id', p.id);
        updatedCount++;
      } else {
        console.log(`Found page for ${p.name} but no images matched.`);
      }
    } else {
      console.log(`Could not find live page for: ${p.name} (Tried handle: ${handle})`);
    }
  }

  console.log(`\nSuccessfully scraped and updated ${updatedCount} products.`);
}

run();
