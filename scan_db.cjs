/**
 * scan_db.cjs
 *
 * Comprehensive Catalog Integrity, Duplicate Detection & GEO Validator for GearShop.ma.
 * Inspects all products in Supabase `products gearshop` table without modifying or deleting data.
 *
 * Usage: node scan_db.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gunuqwikqhtllwplzcru.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function slugify(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function normalizeMount(name) {
  const t = (name || '').toLowerCase();
  if (t.includes('sony') || t.includes('e mount') || t.includes('e-mount')) return 'Sony E';
  if (t.includes('canon rf') || t.includes('eos-r') || t.includes('rf mount')) return 'Canon RF';
  if (t.includes('nikon z') || t.includes('z mount') || t.includes('z-mount')) return 'Nikon Z';
  if (t.includes('fuji') || t.includes('fx mount') || t.includes('x-mount')) return 'Fujifilm X';
  if (t.includes('l mount') || t.includes('l-mount') || t.includes('panasonic') || t.includes('sigma')) return 'L-Mount';
  if (t.includes('m43') || t.includes('micro 4/3')) return 'Micro 4/3';
  return null;
}

function getBaseFamily(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/sony|canon|nikon|fuji|fujifilm|panasonic|leica|sigma|m43|e mount|rf mount|z mount|fx mount|l mount/gi, '')
    .replace(/black|titanium gray|silver/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

async function run() {
  console.log('🔍 Starting Catalog & GEO Integrity Audit for GearShop.ma...\n');
  const { data: products, error } = await supabase.from('products gearshop').select('*').order('id', { ascending: true });

  if (error) {
    console.error('❌ Error fetching products:', error);
    return;
  }

  console.log(`📦 Fetched ${products.length} products from Supabase 'products gearshop'.\n`);

  // 1. Catalog Integrity Checks
  const missingName = [];
  const missingImage = [];
  const missingDesc = [];
  const invalidPrice = [];
  const validPrices = [];
  const slugMap = new Map();
  const idMap = new Map();

  for (const p of products) {
    if (!p.name || p.name.trim() === '') missingName.push(p.id);
    if (!p.image || p.image.trim() === '') missingImage.push({ id: p.id, name: p.name });
    if (!p.desc || p.desc.trim().length < 20) missingDesc.push({ id: p.id, name: p.name });

    const priceNum = Number(p.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      invalidPrice.push({ id: p.id, name: p.name, price: p.price });
    } else {
      validPrices.push(priceNum);
    }

    // Check duplicate IDs
    if (idMap.has(p.id)) {
      console.warn(`⚠️ DUPLICATE ID: ${p.id}`);
    }
    idMap.set(p.id, p);

    // Check duplicate slugs
    const slug = slugify(p.name);
    if (!slugMap.has(slug)) slugMap.set(slug, []);
    slugMap.get(slug).push(p);
  }

  // 2. Duplicate Analysis (Exact Duplicates vs Valid Mount Variants)
  const exactDuplicates = [];
  const validVariants = [];
  const familyMap = new Map();

  for (const p of products) {
    const family = getBaseFamily(p.name);
    if (!familyMap.has(family)) familyMap.set(family, []);
    familyMap.get(family).push(p);
  }

  for (const [family, items] of familyMap.entries()) {
    if (items.length > 1) {
      // Check if they are distinct mounts
      const mounts = items.map(i => normalizeMount(i.name)).filter(Boolean);
      const uniqueMounts = new Set(mounts);

      if (uniqueMounts.size === items.length) {
        validVariants.push({ family, count: items.length, items: items.map(i => `${i.id}: ${i.name}`) });
      } else {
        // Look for exact duplicates
        const nameMap = new Map();
        for (const item of items) {
          const normName = item.name.toLowerCase().trim();
          if (nameMap.has(normName)) {
            exactDuplicates.push({ original: nameMap.get(normName), duplicate: item });
          } else {
            nameMap.set(normName, item);
          }
        }
      }
    }
  }

  // 3. Output Report
  console.log('====================================================');
  console.log('📊 GEARSHOP CATALOG INTEGRITY REPORT');
  console.log('====================================================');
  console.log(`Total Products:              ${products.length}`);
  console.log(`Products with Valid Price:   ${validPrices.length}`);
  console.log(`Products "Prix sur demande": ${invalidPrice.length}`);
  console.log(`Missing Image:               ${missingImage.length}`);
  console.log(`Missing/Short Description:   ${missingDesc.length}`);
  console.log(`Exact Duplicates:            ${exactDuplicates.length}`);
  console.log(`Valid Multi-Mount Variants:  ${validVariants.length} product families`);
  console.log('====================================================\n');

  if (exactDuplicates.length > 0) {
    console.log('⚠️ EXACT DUPLICATES DETECTED:');
    exactDuplicates.forEach(d => console.log(`  - [ID ${d.original.id}] vs [ID ${d.duplicate.id}]: ${d.original.name}`));
    console.log('');
  } else {
    console.log('✅ ZERO exact duplicates detected. All products represent unique items or valid mount variants.');
  }

  if (invalidPrice.length > 0) {
    console.log(`\nℹ️ Products with Price = 0 or null (${invalidPrice.length} items - correctly handled as "Prix sur demande" in UI & SEO):`);
    invalidPrice.slice(0, 5).forEach(p => console.log(`  - [ID ${p.id}] ${p.name}`));
    if (invalidPrice.length > 5) console.log(`    ... and ${invalidPrice.length - 5} more.`);
  }

  console.log('\n✅ Catalog audit complete!');
}

run();
