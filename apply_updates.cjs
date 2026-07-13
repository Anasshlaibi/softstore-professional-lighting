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

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

async function run() {
  const report = fs.readFileSync('match_report.csv', 'utf8').split('\n');
  let updatedCount = 0;

  for (let i = 1; i < report.length; i++) {
    const line = report[i].trim();
    if (!line) continue;
    
    // "1023","AF50mm F1.8 Nikon (Z Mount) - Black","50mm","F1.8","Z","af-25-35-50mm-f1-8-aps-c-lens-for-e-fx-z","100%"
    // Simple regex for CSV parsing
    const match = line.match(/"([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
    if (!match) continue;
    
    const [_, id, name, focal, aperture, mount, handle, confidence] = match;
    
    if (confidence !== "100%") continue;
    
    const sp = shopifyProducts.find(p => p.handle === handle);
    if (!sp) continue;

    // Try to find correct variant for hero image
    let heroImage = null;
    let fallbackImage = sp.images.length > 0 ? sp.images[0].src : null;
    
    for (const variant of sp.variants) {
       // Match variant title with mount and color
       // If mount is Z, variant should have Nikon or Z
       let variantMatches = true;
       const vtitle = variant.title.toLowerCase();
       if (mount === 'Z' && !vtitle.includes('nikon') && !vtitle.includes('z')) variantMatches = false;
       if (mount === 'E' && !vtitle.includes('sony') && !vtitle.includes('e')) variantMatches = false;
       if (mount === 'RF' && !vtitle.includes('canon') && !vtitle.includes('rf')) variantMatches = false;
       if (mount === 'FX' && !vtitle.includes('fuji') && !vtitle.includes('x')) variantMatches = false;
       if (mount === 'M43' && !vtitle.includes('m43') && !vtitle.includes('mft')) variantMatches = false;
       if (mount === 'L' && !vtitle.includes('panasonic') && !vtitle.includes('l')) variantMatches = false;
       
       if (variantMatches && variant.featured_image && variant.featured_image.src) {
          heroImage = variant.featured_image.src;
          break;
       }
    }
    
    const finalHero = heroImage || fallbackImage;
    if (!finalHero) continue;

    // Prepare gallery array (filter out duplicates)
    let gallery = [];
    let seen = new Set();
    
    // Add hero first
    gallery.push(finalHero);
    seen.add(finalHero);
    
    for (const img of sp.images) {
      if (!seen.has(img.src)) {
        gallery.push(img.src);
        seen.add(img.src);
      }
    }
    
    // URL Validation
    const validGallery = [];
    for (let g of gallery) {
       if (g.startsWith('http://')) g = g.replace('http://', 'https://');
       // Remove query params if we want, but Shopify needs them for cache sometimes.
       const isValid = await validateUrl(g);
       if (isValid) {
         validGallery.push(g);
       }
    }
    
    if (validGallery.length === 0) continue;
    
    const finalHeroUrl = validGallery[0];
    
    // Update Supabase
    const { error } = await supabase.from('products gearshop').update({
      image: finalHeroUrl,
      gallery: validGallery
    }).eq('id', id);
    
    if (error) {
      console.error(`Failed to update ${name}:`, error);
    } else {
      console.log(`Updated ${name} successfully! Hero: ${finalHeroUrl}`);
      updatedCount++;
    }
  }
  
  console.log(`\nFinished updating ${updatedCount} matched products with 100% confidence!`);
}

run().catch(console.error);
