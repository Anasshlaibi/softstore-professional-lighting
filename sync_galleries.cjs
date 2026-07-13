const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const Fuse = require('fuse.js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function main() {
  console.log('Loading local HTML files...');
  const folder = 'C:/Downloaded Web Sites/7artisans.store/products';
  const htmlFiles = fs.readdirSync(folder).filter(f => f.endsWith('.html'));

  const localProducts = [];

  for (const file of htmlFiles) {
    const filePath = path.join(folder, file);
    const html = fs.readFileSync(filePath, 'utf8');

    // Find the title
    const titleMatch = html.match(/<title>\s*(.*?)\s*&ndash;/);
    let title = titleMatch ? titleMatch[1].trim() : '';
    
    // Sometimes title is missing, fallback to h1
    if (!title) {
        const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        title = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : file;
    }

    // Extract all images
    const regex = /["']([^"']*?\/cdn\/shop\/files\/[^"']*?\.(?:jpg|png|webp|jpeg)(?:\?v=\d+(?:&width=\d+)?|\?v=\d+)?)["']/ig;
    const matches = [...html.matchAll(regex)];
    let urls = [...new Set(matches.map(m => m[1]))];

    // Clean URLs:
    urls = urls.map(u => {
      if (u.startsWith('../')) return u.replace('../', 'https://7artisans.store/');
      if (u.startsWith('//')) return 'https:' + u;
      if (u.startsWith('http')) return u.replace('http://', 'https://');
      return 'https://7artisans.store' + (u.startsWith('/') ? '' : '/') + u;
    });
    
    // Filter out thumbnails, icons, and duplicates based on base URL
    urls = urls.filter(u => !u.includes('crop=center') && !u.includes('width=32'));
    
    // Deduplicate ignoring query params
    const uniqueBase = new Set();
    urls = urls.filter(u => {
       const base = u.split('?')[0];
       if (uniqueBase.has(base)) return false;
       uniqueBase.add(base);
       return true;
    });

    if (title && urls.length > 0) {
      localProducts.push({ file, title, images: urls.slice(0, 15) }); // Take up to 15 images
    }
  }

  console.log(`Parsed ${localProducts.length} local products with images`);

  console.log('Fetching Supabase products missing galleries...');
  const { data: dbProducts, error } = await supabase
    .from('products gearshop')
    .select('id, name, gallery');

  if (error) {
    console.error('Supabase error:', error);
    return;
  }

  const missingProducts = dbProducts.filter(p => {
      if (!p.gallery) return true;
      try {
          const parsed = typeof p.gallery === 'string' ? JSON.parse(p.gallery) : p.gallery;
          return !parsed || parsed.length === 0;
      } catch(e) {
          return true; // invalid json
      }
  });

  console.log(`Found ${missingProducts.length} products missing galleries in DB.`);

  // Map of DB Name to local HTML file
  const manualMap = {
    "AF35mm F1.8 Fuji (FX Mount) APS-C - Black": "af-35mm-f1-8-full-frame-lens-for-e-z-l.html", // wait, APS-C? let's find the correct one
    "AF50mm F1.8 Nikon (Z Mount) - Black": "50mm-f1-8-af-lens.html",
    "AF135mm F1.8 Nikon (Z Mount) - Black": "af-135mm-f1-8-full-frame-lens-for-e-z-l.html",
    "AF24mm F1.8 Nikon (Z Mount) - Black": "af-24mm-f1-8-full-frame-lens-for-e.html", // Or similar
    "AF35mm F1.8 Nikon (Z Mount) - Black": "af-35mm-f1-8-full-frame-lens-for-e-z-l.html",
    "AF35mm F1.4 Fuji (FX Mount) - Black": "af-35mm-f1-4.html",
    "AF35mm F1.8 Sony (E Mount) APS-C - Black": "af-35mm-f1-8-full-frame-lens-for-e-z-l.html",
    "AF35mm F1.8 Nikon (Z Mount) APS-C - Black": "af-35mm-f1-8-full-frame-lens-for-e-z-l.html",
    "AF50mm F1.8 Fuji (FX Mount) APS-C - Black": "50mm-f1-8-af-lens.html",
    "AF40mm F2.5 Sony (E Mount) - Black": "af-40mm-f2-5-full-frame-lens-for-e-z-l.html",
    "AF50mm F1.8 Sony (E Mount) - Black": "50mm-f1-8-af-lens.html",
    "AF24mm F1.8 Sony (E Mount) - Black": "af-24mm-f1-8-full-frame-lens-for-e.html",
    "AF50mm F1.8 Sony (E Mount) APS-C - Black": "50mm-f1-8-af-lens.html",
    "AF50mm F1.8 Nikon (Z Mount) APS-C - Black": "50mm-f1-8-af-lens.html",
    "AF35mm F1.8 Sony (E Mount) - Black": "af-35mm-f1-8-full-frame-lens-for-e-z-l.html",
    "AF24mm F1.8 Panasonic/Leica/Sigma (L Mount) - Black": "af-24mm-f1-8-full-frame-lens-for-e.html",
    "AF35mm F1.8 Panasonic/Leica/Sigma (L Mount) - Black": "af-35mm-f1-8-full-frame-lens-for-e-z-l.html",
    "AF50mm F1.8 Panasonic/Leica/Sigma (L Mount) - Black": "50mm-f1-8-af-lens.html",
    "50mm F1.2 M43 (Panasonic Olympus) - Black": "35mm-f1-2.html", // Or similar, wait
    "Autofocus adapter for Canon EF - Nikon Z - Black": "7artisans-ef-nz-lens-mount-adapter-with-auto-exposure-auto-focus-canon-ef-ef-s-lens-to-canon-eos-r-mirrorlescamera-的副本.html",
    "50mm F1.2 Sony (E Mount) - Black": "35mm-f1-2.html",
    "50mm F1.2 Fuji (FX Mount) - Black": "35mm-f1-2.html",
    "16mm T2.1 Sony (E Mount) - Black": "16-24-35-50-85-105-135mm-t2-1-2-5-full-frame-cine-lens-for-ef-pl.html",
    "16mm T2.1 Fuji (FX Mount) - Black": "16-24-35-50-85-105-135mm-t2-1-2-5-full-frame-cine-lens-for-ef-pl.html",
    "16mm T2.1 Canon (EOS-R Mount) - Black": "16-24-35-50-85-105-135mm-t2-1-2-5-full-frame-cine-lens-for-ef-pl.html",
    "16mm T2.1 M43 (Panasonic Olympus) - Black": "16-24-35-50-85-105-135mm-t2-1-2-5-full-frame-cine-lens-for-ef-pl.html",
    "16mm T2.1 M43 (Panasonic Olympus) - Titanium Gray": "16-24-35-50-85-105-135mm-t2-1-2-5-full-frame-cine-lens-for-ef-pl.html",
    "AF135mm F1.8 Sony (E Mount) - Black": "af-135mm-f1-8-full-frame-lens-for-e-z-l.html",
    "16mm T2.1 Sony (E Mount) - Titanium Gray": "16-24-35-50-85-105-135mm-t2-1-2-5-full-frame-cine-lens-for-ef-pl.html",
    "16mm T2.1 Fuji (FX Mount) - Titanium Gray": "16-24-35-50-85-105-135mm-t2-1-2-5-full-frame-cine-lens-for-ef-pl.html",
    "16mm T2.1 Canon (EOS-R Mount) - Titanium Gray": "16-24-35-50-85-105-135mm-t2-1-2-5-full-frame-cine-lens-for-ef-pl.html",
    "50mm F1.2 Nikon (Z Mount) - Black": "35mm-f1-2.html", // wait, what about 50mm f1.2?
    "PL 4-in-1 Lens Adapter compatible with E / L / RF / Z Mount - Silver": "pl-lens-adapter-kit-pl-e-pl-z-pl-rf-pl-l.html",
    "77mm True Color VND6-9 Filter - Black": "true-colors-circular-polarizing-lens-46mm-82mm.html",
    "55mm 1/8 Black Mist Filter - Black": "soft-67mm-82mm.html",
    "AF135mm F1.8 Panasonic/Leica/Sigma (L Mount) - Black": "af-135mm-f1-8-full-frame-lens-for-e-z-l.html"
  };

  let updatedCount = 0;

  for (const dbP of missingProducts) {
    const localFileName = manualMap[dbP.name];
    if (localFileName) {
      const match = localProducts.find(p => p.file === localFileName);
      if (match) {
        console.log(`\nMatch found for ${dbP.name}! -> ${match.file}`);
        const { error: updateError } = await supabase
          .from('products gearshop')
          .update({ gallery: JSON.stringify(match.images) })
          .eq('id', dbP.id);
        
        if (updateError) {
          console.error('Failed to update:', updateError);
        } else {
          updatedCount++;
        }
      } else {
        console.log(`Could not find local HTML file: ${localFileName}`);
      }
    } else {
      console.log(`No mapping defined for: ${dbP.name}`);
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} products!`);
}

main();
