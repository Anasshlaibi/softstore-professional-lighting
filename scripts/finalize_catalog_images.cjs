const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

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

async function finalizeCatalogImages() {
  console.log('--- Step 1: Loading All Products from Supabase ---');
  const { data: products, error } = await supabase.from('products gearshop').select('*');
  if (error) {
    console.error('Supabase query error:', error);
    return;
  }

  const existingLocalFiles = fs.readdirSync('public/images/products');
  console.log(`Current local images on disk: ${existingLocalFiles.length}`);

  let updatedCount = 0;
  let remainingMissing = 0;

  for (const p of products) {
    const cleanSlug = slugify(p.name);
    const targetFilename = `${cleanSlug}.webp`;
    const localDiskPath = `public/images/products/${targetFilename}`;
    const localWebPath = `/images/products/${targetFilename}`;

    // If exact target already exists and is valid
    if (fs.existsSync(localDiskPath) && fs.statSync(localDiskPath).size > 1000) {
      if (p.image !== localWebPath) {
        await supabase.from('products gearshop').update({
          image: localWebPath,
          gallery: [localWebPath]
        }).eq('id', p.id);
        updatedCount++;
      }
      continue;
    }

    // If not, find the closest matching local image from the same series / brand / focal length
    let fallbackImage = null;

    // 1. 7Artisans / Lenses series fallback (e.g. 50mm, 35mm, 10mm, 16mm, 85mm, 135mm, AF series)
    const focalMatch = p.name.match(/(?:AF\s*)?(\d+mm(?:\s*F\d+(?:\.\d+)?|\s*T\d+(?:\.\d+)?))/i) || p.name.match(/(\d+mm)/i);
    if (focalMatch) {
      const focalSlug = slugify(focalMatch[1]);
      const matchingFile = existingLocalFiles.find(f => f.includes(focalSlug) && f.endsWith('.webp'));
      if (matchingFile) {
        fallbackImage = `/images/products/${matchingFile}`;
      }
    }

    // 2. Insta360 series (Flow, X4/X5, Ace Pro, Link 2, Selfie Stick, Mount)
    if (!fallbackImage && p.name.toLowerCase().includes('insta360')) {
      if (p.name.toLowerCase().includes('flow')) {
        const flowImg = existingLocalFiles.find(f => f.includes('flow') || f.includes('stabilisateur'));
        if (flowImg) fallbackImage = `/images/products/${flowImg}`;
      } else if (p.name.toLowerCase().includes('x4') || p.name.toLowerCase().includes('x5') || p.name.toLowerCase().includes('360')) {
        const xImg = existingLocalFiles.find(f => f.includes('insta360') || f.includes('dji-360') || f.includes('ace-pro'));
        if (xImg) fallbackImage = `/images/products/${xImg}`;
      } else if (p.name.toLowerCase().includes('stick') || p.name.toLowerCase().includes('perche')) {
        const stickImg = existingLocalFiles.find(f => f.includes('stick') || f.includes('trepied') || f.includes('vesta'));
        if (stickImg) fallbackImage = `/images/products/${stickImg}`;
      } else if (p.name.toLowerCase().includes('mount') || p.name.toLowerCase().includes('support') || p.name.toLowerCase().includes('frame') || p.name.toLowerCase().includes('cage')) {
        const mountImg = existingLocalFiles.find(f => f.includes('smallrig') || f.includes('support') || f.includes('cage'));
        if (mountImg) fallbackImage = `/images/products/${mountImg}`;
      }
    }

    // 3. Studio lights / Projectors (Y300S, YM350, YB-300R, BKL400, P-60S, Godox Flash)
    if (!fallbackImage && (p.category === 'studio' || p.category === 'portable' || p.category === 'Flash' || p.name.toLowerCase().includes('flash') || p.name.toLowerCase().includes('godox'))) {
      const studioImg = existingLocalFiles.find(f => f.includes('godox') || f.includes('sk400') || f.includes('eclairage') || f.includes('studio') || f.includes('sl150'));
      if (studioImg) fallbackImage = `/images/products/${studioImg}`;
    }

    // 4. Vanguard / Bags / Tripods
    if (!fallbackImage && (p.name.toLowerCase().includes('vanguard') || p.name.toLowerCase().includes('sac') || p.name.toLowerCase().includes('trepied') || p.name.toLowerCase().includes('bag'))) {
      const bagImg = existingLocalFiles.find(f => f.includes('vanguard') || f.includes('sac') || f.includes('trepied') || f.includes('vesta'));
      if (bagImg) fallbackImage = `/images/products/${bagImg}`;
    }

    // 5. Sony Alpha 7 V / Hybrid cameras
    if (!fallbackImage && p.name.toLowerCase().includes('sony alpha')) {
      const sonyImg = existingLocalFiles.find(f => f.includes('sony') && f.includes('alpha'));
      if (sonyImg) fallbackImage = `/images/products/${sonyImg}`;
    }

    // 6. Generic brand matching if available
    if (!fallbackImage && p.brand) {
      const brandSlug = slugify(p.brand);
      const brandImg = existingLocalFiles.find(f => f.startsWith(brandSlug) && f.endsWith('.webp'));
      if (brandImg) fallbackImage = `/images/products/${brandImg}`;
    }

    // Copy to the specific clean SEO target file if found
    if (fallbackImage) {
      const sourcePath = `public${fallbackImage}`;
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, localDiskPath);
        await supabase.from('products gearshop').update({
          image: localWebPath,
          gallery: [localWebPath]
        }).eq('id', p.id);
        updatedCount++;
        console.log(`[Mapped & Linked] ${p.name} -> ${targetFilename}`);
      }
    } else {
      remainingMissing++;
      console.warn(`[Unmapped] ${p.id} | ${p.name}`);
    }
  }

  console.log('\n--- Final Ingestion Status ---');
  console.log(`Successfully mapped and updated: ${updatedCount} products in Supabase.`);
  console.log(`Remaining unmapped: ${remainingMissing} products.`);
}

finalizeCatalogImages().catch(console.error);
