const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);
const shopifyProducts = JSON.parse(fs.readFileSync('all_shopify_products.json', 'utf8'));

async function validateUrl(url) {
  if (!url) return false;
  if (!url.startsWith('https://')) return false;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

const manualMap = {
  1034: { handle: 'mf-50mm-f-1-2-aps-c-lens-for-sony-e-fuji-x-eos-r-nikon-z-panasonic-olympus-m43', mount: 'M43' },
  1032: { handle: 'mf-50mm-f-1-2-aps-c-lens-for-sony-e-fuji-x-eos-r-nikon-z-panasonic-olympus-m43', mount: 'E' },
  1033: { handle: 'mf-50mm-f-1-2-aps-c-lens-for-sony-e-fuji-x-eos-r-nikon-z-panasonic-olympus-m43', mount: 'FX' },
  1035: { handle: 'mf-50mm-f-1-2-aps-c-lens-for-sony-e-fuji-x-eos-r-nikon-z-panasonic-olympus-m43', mount: 'Z' },
  1055: { handle: '10', mount: 'RF' },
  1052: { handle: '10', mount: 'E' },
  1057: { handle: '10', mount: 'FX' },
  1059: { handle: '10', mount: 'RF' },
  1056: { handle: '10', mount: 'E' },
  1058: { handle: '10', mount: 'M43' },
  1053: { handle: '10', mount: 'FX' },
  1054: { handle: '10', mount: 'M43' },
  1061: { handle: 'variable-nd-filter-67mm-82mm', mount: null },
  1060: { handle: 'pl-lens-adapter-kit-pl-e-pl-z-pl-rf-pl-l', mount: null },
};

async function run() {
  let updatedCount = 0;
  
  for (const id in manualMap) {
    const { handle, mount } = manualMap[id];
    const sp = shopifyProducts.find(p => p.handle === handle);
    if (!sp) continue;

    let heroImage = null;
    let fallbackImage = sp.images.length > 0 ? sp.images[0].src : null;
    
    for (const variant of sp.variants) {
       let variantMatches = true;
       if (mount) {
         const vtitle = variant.title.toLowerCase();
         if (mount === 'Z' && !vtitle.includes('nikon') && !vtitle.includes('z')) variantMatches = false;
         if (mount === 'E' && !vtitle.includes('sony') && !vtitle.includes('e')) variantMatches = false;
         if (mount === 'RF' && !vtitle.includes('canon') && !vtitle.includes('rf')) variantMatches = false;
         if (mount === 'FX' && !vtitle.includes('fuji') && !vtitle.includes('x')) variantMatches = false;
         if (mount === 'M43' && !vtitle.includes('m43') && !vtitle.includes('mft')) variantMatches = false;
         if (mount === 'L' && !vtitle.includes('panasonic') && !vtitle.includes('l')) variantMatches = false;
       }
       
       if (variantMatches && variant.featured_image && variant.featured_image.src) {
          heroImage = variant.featured_image.src;
          break;
       }
    }
    
    const finalHero = heroImage || fallbackImage;
    if (!finalHero) continue;

    let gallery = [];
    let seen = new Set();
    gallery.push(finalHero);
    seen.add(finalHero);
    
    for (const img of sp.images) {
      if (!seen.has(img.src)) {
        gallery.push(img.src);
        seen.add(img.src);
      }
    }
    
    const validGallery = [];
    for (let g of gallery) {
       if (g.startsWith('http://')) g = g.replace('http://', 'https://');
       const isValid = await validateUrl(g);
       if (isValid) validGallery.push(g);
    }
    
    if (validGallery.length === 0) continue;
    
    const finalHeroUrl = validGallery[0];
    const { error } = await supabase.from('products gearshop').update({
      image: finalHeroUrl,
      gallery: validGallery
    }).eq('id', id);
    
    if (!error) {
      console.log(`Updated ID ${id} successfully! Hero: ${finalHeroUrl}`);
      updatedCount++;
    } else {
      console.error(`Error updating ID ${id}:`, error);
    }
  }
  
  console.log(`Finished manually mapping ${updatedCount} products!`);
}

run().catch(console.error);
