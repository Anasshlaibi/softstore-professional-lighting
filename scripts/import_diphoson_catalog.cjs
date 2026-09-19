/**
 * scripts/import_diphoson_catalog.cjs
 * 
 * Ingestion & Moroccan SEO Optimization Engine for Diphoson Photo Catalog (T2 18-09-2026).
 * Features:
 *   - Staged Wave rollouts (Wave 1: High Margins & Promos, Wave 2: Creators & Audio, Wave 3: Pro Bodies & Glass)
 *   - Automatic calculation of promo vs strikethrough old price
 *   - Moroccan local search SEO description generator (Casablanca, Rabat, Marrakech, Garantie 1 An)
 *   - Structured technical specs & brand-tailored HD imagery
 *   - Text encoding repair for French accents (Réf, Boîtier, Numérique, etc.)
 *
 * Usage:
 *   node scripts/import_diphoson_catalog.cjs --wave=1 --dry-run
 *   node scripts/import_diphoson_catalog.cjs --wave=1
 *   node scripts/import_diphoson_catalog.cjs --wave=2
 *   node scripts/import_diphoson_catalog.cjs --wave=3
 *   node scripts/import_diphoson_catalog.cjs --all
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gunuqwikqhtllwplzcru.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EXCEL_PATH = path.resolve('C:\\Users\\HELIOS NEO 16\\Downloads\\TARIF PHOTO T2 18-09-2026 (1).xlsx');

// Parse CLI flags
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const waveArg = args.find(a => a.startsWith('--wave='));
const targetWave = waveArg ? parseInt(waveArg.split('=')[1], 10) : (args.includes('--all') ? 'all' : 1);

function fixEncoding(str) {
  if (!str) return '';
  return String(str)
    .replace(/Rf/g, 'Réf')
    .replace(/Numrique/g, 'Numérique')
    .replace(/numrique/g, 'numérique')
    .replace(/Botier/g, 'Boîtier')
    .replace(/botier/g, 'boîtier')
    .replace(/Boite  Lumire/g, 'Boite à Lumière')
    .replace(/Poigne/g, 'Poignée')
    .replace(/poigne/g, 'poignée')
    .replace(/Trpied/g, 'Trépied')
    .replace(/trpied/g, 'trépied')
    .replace(/Mmoire/g, 'Mémoire')
    .replace(/mmoire/g, 'mémoire')
    .replace(/\uFFFD/g, 'é')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCategory(cat, name) {
  const c = (cat || '').toLowerCase().trim();
  const n = (name || '').toLowerCase().trim();

  if (c.includes('appareil') || c.includes('camera') || n.includes('appareil photo') || n.includes('apn ') || n.includes('camera')) return 'cameras';
  if (c.includes('objectif') || n.includes('objectif') || n.includes('lens') || n.includes('sel ') || n.includes('nikkor')) return 'lenses';
  if (c.includes('lumi') || c.includes('flash') || c.includes('boite') || c.includes('tube') || c.includes('softbox') || n.includes('led') || n.includes('flash') || n.includes('light')) return 'lighting';
  if (c.includes('stabilisateur') || c.includes('trepied') || c.includes('support') || c.includes('perche') || c.includes('poign') || c.includes('cage') || n.includes('cage') || n.includes('tripod') || n.includes('gimbal')) return 'rigs';
  if (c.includes('micro') || c.includes('casque') || n.includes('micro') || n.includes('wireless') || n.includes('lark') || n.includes('audio') || n.includes('solidcom')) return 'audio';
  return 'accessories';
}

function getBrandDefaultImage(brand, name, category) {
  const b = (brand || '').toUpperCase().trim();
  const n = (name || '').toLowerCase();
  
  if (b === 'GODOX') {
    if (n.includes('tube') || n.includes('tl120') || n.includes('tl60')) {
      return 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80';
    }
    if (n.includes('softbox') || n.includes('boite') || n.includes('p120')) {
      return 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80';
    }
    if (n.includes('flash') || n.includes('v860') || n.includes('v1')) {
      return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
  }
  if (b === 'SMALLRIG') {
    return 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80';
  }
  if (b === 'VANGUARD') {
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80';
  }
  if (b === 'INSTA360') {
    return 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80';
  }
  if (b === 'CANON') {
    return 'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?auto=format&fit=crop&w=800&q=80';
  }
  if (b === 'SONY DI' || b === 'SONY') {
    return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
  }
  if (b === 'NIKON') {
    return 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80';
  }
  if (b === 'HOLLYLAND') {
    return 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80';
}

function generateProductSEO(product) {
  const { name, brand, category, price, oldPrice, hasPromo, code, stock } = product;
  const brandName = brand ? brand.toUpperCase() : 'PROFESSIONNEL';
  
  const discountPercent = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  
  // Moroccan SEO Optimized Description
  const promoText = discountPercent > 0
    ? `🔥 OFFRE PROMOTIONNELLE : ${price} MAD au lieu de ${oldPrice} MAD (-${discountPercent}% de réduction | Économisez ${Math.round(oldPrice - price)} MAD).`
    : `Prix officiel garanti : ${price} MAD.`;

  const stockText = stock > 0 ? `En stock immédiat (${stock} unités disponibles).` : `Disponible sur commande express (24-48h).`;

  const desc = `${name} - Matériel Audiovisuel Professionnel Maroc.
${promoText}

${name} est un équipement de référence sélectionné pour les professionnels de l'image, créateurs de contenu et studios audiovisuels au Maroc. Distribué avec garantie officielle de 1 an et support client à Casablanca.

POINTS FORTS & CARACTÉRISTIQUES :
• Marque certifiée : ${brandName}
• Catégorie : ${category.toUpperCase()}
• Code Référence / EAN : ${code || 'Standard'}
• Disponibilité : ${stockText}
• Livraison Express 24-48H à Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir et partout au Maroc.
• Facture Pro avec TVA récupérable disponible sur simple demande.`;

  // Structured Specs Array
  const specs = [
    `Marque : ${brandName}`,
    `Catégorie : ${category.charAt(0).toUpperCase() + category.slice(1)}`,
    code ? `Code EAN : ${code}` : 'Qualité Pro Certifiée',
    stock > 0 ? `Stock Disponible : ${stock} pcs` : 'Sur Commande Express',
    discountPercent > 0 ? `Promotion Spéciale : -${discountPercent}%` : 'Meilleur Prix Maroc Garanti',
    'Garantie 1 An & Support Local Maroc'
  ];

  return { desc, specs };
}

async function run() {
  console.log('===========================================================');
  console.log('🚀 DIPHOSON CATALOG IMPORT & SEO OPTIMIZATION ENGINE');
  console.log(`🎯 Target Wave: ${targetWave} | Dry Run: ${isDryRun ? 'YES (Simulated)' : 'NO (Live Upload)'}`);
  console.log('===========================================================\n');

  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`❌ Excel file not found at: ${EXCEL_PATH}`);
    process.exit(1);
  }

  // 1. Read Workbook
  const workbook = xlsx.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // Rows 0 to 3 are headers, data starts at index 4
  const dataRows = rawRows.slice(4).filter(r => r && r.length > 1 && r[1]);
  console.log(`📄 Found ${dataRows.length} total product rows in Excel.`);

  // 2. Fetch existing products from DB
  const { data: existingProducts, error: dbError } = await supabase.from('products gearshop').select('id, name');
  if (dbError) {
    console.error('❌ Error reading Supabase DB:', dbError);
    process.exit(1);
  }

  const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase().trim()));
  let maxId = existingProducts.reduce((max, p) => Math.max(max, p.id || 0), 0);
  if (maxId < 3000) maxId = 3000;

  console.log(`📦 Current database products: ${existingProducts.length} (Next start ID: ${maxId + 1})\n`);

  // 3. Parse products
  const parsedItems = [];
  for (const r of dataRows) {
    const code = r[0] ? String(r[0]).trim() : '';
    const rawName = r[1] ? String(r[1]).trim() : '';
    const name = fixEncoding(rawName);
    const brand = r[2] ? fixEncoding(r[2]) : 'Autre';
    const catRaw = r[3] ? fixEncoding(r[3]) : '';
    const stock = (typeof r[4] === 'number') ? r[4] : parseInt(r[4] || 0, 10);
    const pa_ht = (typeof r[5] === 'number') ? r[5] : parseFloat(r[5] || 0);
    const p_net_ttc = (typeof r[6] === 'number') ? r[6] : parseFloat(r[6] || 0);
    const p_pub_ttc = (typeof r[7] === 'number') ? r[7] : parseFloat(r[7] || 0);
    const pa_promo = (typeof r[8] === 'number') ? r[8] : parseFloat(r[8] || 0);
    const net_promo = (typeof r[9] === 'number') ? r[9] : parseFloat(r[9] || 0);
    const pub_promo = (typeof r[10] === 'number') ? r[10] : parseFloat(r[10] || 0);

    const hasPromo = Boolean(pub_promo && pub_promo > 0 && net_promo && net_promo > 0);
    
    let currPrice = 0;
    let oldPrice = null;

    if (hasPromo) {
      currPrice = Math.round(pub_promo);
      if (p_pub_ttc && p_pub_ttc > pub_promo) {
        oldPrice = Math.round(p_pub_ttc);
      } else if (p_net_ttc && net_promo) {
        const ratio = p_net_ttc / net_promo;
        const estNormal = Math.round((pub_promo * ratio) / 10) * 10;
        if (estNormal > currPrice) {
          oldPrice = estNormal;
        } else {
          oldPrice = Math.round(currPrice * 1.12);
        }
      }
    } else {
      currPrice = Math.round(p_pub_ttc || 0);
      oldPrice = null;
    }

    if (!name || currPrice <= 0) continue;

    const brandUpper = brand.toUpperCase();
    const category = normalizeCategory(catRaw, name);

    // Classify Wave
    let wave = 2;
    if (['GODOX', 'SMALLRIG', 'VANGUARD'].includes(brandUpper) || hasPromo) {
      wave = 1;
    } else if (['INSTA360', 'HOLLYLAND', 'KODAK', 'PNY', 'AGFA'].includes(brandUpper)) {
      wave = 2;
    } else if (['SONY DI', 'SONY', 'CANON', 'NIKON', 'FUJIFILM', 'DJI'].includes(brandUpper)) {
      wave = 3;
    }

    parsedItems.push({
      code,
      name,
      brand,
      category,
      stock,
      price: currPrice,
      oldPrice,
      hasPromo,
      wave,
      inStock: stock > 0
    });
  }

  // Filter target wave
  const targetItems = targetWave === 'all' 
    ? parsedItems 
    : parsedItems.filter(p => p.wave === targetWave);

  console.log(`🎯 Wave ${targetWave} selected: ${targetItems.length} products to evaluate.`);

  // 4. Prepare Payloads
  const toInsert = [];
  let skippedDuplicates = 0;

  for (const item of targetItems) {
    if (existingNames.has(item.name.toLowerCase().trim())) {
      skippedDuplicates++;
      continue;
    }

    const { desc, specs } = generateProductSEO(item);
    const image = getBrandDefaultImage(item.brand, item.name, item.category);

    maxId++;
    toInsert.push({
      id: maxId,
      name: item.name,
      price: item.price,
      oldPrice: item.oldPrice,
      rentPrice: 0,
      category: item.category,
      image: image,
      gallery: [image],
      video: '',
      desc: desc,
      stars: 5.0,
      specs: specs,
      inStock: item.inStock,
      promoEligible: item.hasPromo ? 'True' : 'False'
    });
  }

  console.log(`⚡ New Unique Products ready for insertion: ${toInsert.length} (Skipped ${skippedDuplicates} existing duplicates)\n`);

  if (toInsert.length === 0) {
    console.log('✅ All products for this wave are already in the database.');
    return;
  }

  // Preview sample
  console.log('📋 Sample Payload Preview:');
  console.log(JSON.stringify(toInsert[0], null, 2));
  console.log('\n-----------------------------------------------------------');

  if (isDryRun) {
    console.log('🔍 DRY RUN COMPLETE: 0 changes made to Supabase.');
    return;
  }

  // 5. Batch Insert into Supabase (Chunks of 20)
  console.log(`🚀 Executing Live Insert of ${toInsert.length} products to Supabase...`);
  const chunkSize = 20;
  let insertedTotal = 0;

  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { data, error } = await supabase.from('products gearshop').insert(chunk).select('id, name');

    if (error) {
      console.error(`❌ Error inserting chunk ${Math.floor(i / chunkSize) + 1}:`, error);
    } else {
      insertedTotal += data.length;
      console.log(`✅ Inserted chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(toInsert.length / chunkSize)} (${data.length} items)`);
    }
  }

  console.log(`\n🎉 SUCCESS: Successfully added ${insertedTotal} products for Wave ${targetWave} to GearShop database!`);
}

run().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
