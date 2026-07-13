const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

const HTML_DIR = 'C:\\Downloaded Web Sites\\7artisans.store\\products';

function extractFromHtml(filePath) {
  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    
    // Extract description
    const descMatch = html.match(/<meta (?:property="og:description"|name="description") content="([^"]+)"/i);
    const desc = descMatch ? descMatch[1] : null;

    // Extract images for gallery
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

    return {
      desc: desc ? desc.substring(0, 500) : null,
      gallery: Array.from(gallery)
    };
  } catch (err) {
    return null;
  }
}

async function run() {
  const { data: products } = await supabase.from('products gearshop').select('*');
  const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));

  let updatedCount = 0;

  for (const product of products) {
    // Try to find matching HTML file (fuzzy match name)
    const baseName = product.name.split(' Sony')[0].split(' Fuji')[0].split(' Nikon')[0].split(' Canon')[0].split(' Panasonic')[0].split(' M43')[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    let bestMatchFile = null;
    for (const f of files) {
      const fName = f.replace('.html', '').toLowerCase();
      if (fName.includes(baseName) || baseName.includes(fName.replace(/-/g, ''))) {
        bestMatchFile = f;
        break;
      }
    }

    if (bestMatchFile) {
      const info = extractFromHtml(path.join(HTML_DIR, bestMatchFile));
      if (info && (info.desc || info.gallery.length > 0)) {
        console.log(`Updating [${product.name}] from ${bestMatchFile}`);
        
        let updatePayload = {};
        // Only update description if it's currently missing or very short
        if (info.desc && (!product.desc || product.desc.length < 20)) {
          updatePayload.desc = info.desc;
        }
        
        // Merge gallery arrays
        let existingGallery = product.gallery || [];
        if (typeof existingGallery === 'string') {
           try { existingGallery = JSON.parse(existingGallery); } catch(e) {}
        }
        if (!Array.isArray(existingGallery)) existingGallery = [];
        
        const newGallery = Array.from(new Set([...existingGallery, ...info.gallery]));
        if (newGallery.length > existingGallery.length) {
          updatePayload.gallery = newGallery;
        }

        if (Object.keys(updatePayload).length > 0) {
          await supabase.from('products gearshop').update(updatePayload).eq('id', product.id);
          updatedCount++;
        }
      }
    }
  }

  console.log(`Updated ${updatedCount} products with scraped info!`);
}

run();
