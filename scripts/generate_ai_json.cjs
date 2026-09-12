/**
 * generate_ai_json.cjs
 *
 * Generates static, high-performance, edge-cached JSON endpoints for AI systems,
 * LLMs, and search agents in `public/ai/`:
 * - public/ai/catalog.json
 * - public/ai/products.json
 * - public/ai/categories.json
 * - public/ai/brands.json
 *
 * Run: node scripts/generate_ai_json.cjs
 * Called automatically during: npm run build
 */

'use strict';

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
  return env;
}

function slugify(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function detectBrand(p) {
  if (p.brand && p.brand.trim()) return p.brand.trim();
  const text = `${p.name || ''} ${p.category || ''} ${p.desc || ''}`.toLowerCase();
  if (text.includes('k&f') || text.includes('concept') || text.includes('kf')) return 'K&F Concept';
  if (text.includes('7artisans')) return '7Artisans';
  if (text.includes('sony')) return 'Sony';
  if (text.includes('canon')) return 'Canon';
  if (text.includes('nikon')) return 'Nikon';
  if (text.includes('fuji') || text.includes('fujifilm')) return 'Fujifilm';
  if (text.includes('panasonic') || text.includes('lumix')) return 'Panasonic Lumix';
  if (text.includes('dji')) return 'DJI';
  if (text.includes('godox')) return 'Godox';
  if (text.includes('rode') || text.includes('røde')) return 'Røde';
  return '7Artisans';
}

function detectMount(p) {
  if (p.mount && p.mount.trim()) return p.mount.trim();
  const text = `${p.name || ''} ${p.desc || ''}`.toLowerCase();
  if (text.includes('sony e') || text.includes('e mount') || text.includes('e-mount')) return 'Sony E';
  if (text.includes('canon rf') || text.includes('eos-r') || text.includes('rf mount')) return 'Canon RF';
  if (text.includes('nikon z') || text.includes('z mount') || text.includes('z-mount')) return 'Nikon Z';
  if (text.includes('fuji') || text.includes('fx mount') || text.includes('x-mount')) return 'Fujifilm X';
  if (text.includes('l mount') || text.includes('l-mount') || text.includes('panasonic') || text.includes('sigma')) return 'L-Mount';
  if (text.includes('m43') || text.includes('micro 4/3')) return 'Micro 4/3';
  return null;
}

function detectSensorCoverage(p) {
  const text = `${p.name || ''} ${p.desc || ''}`.toLowerCase();
  if (text.includes('aps-c') || text.includes('apsc') || text.includes('crop')) return 'APS-C';
  if (text.includes('m43') || text.includes('micro 4/3')) return 'Micro 4/3';
  if (text.includes('medium format')) return 'Medium Format';
  return 'Full Frame';
}

function detectFocus(p) {
  const text = `${p.name || ''} ${p.desc || ''}`.toLowerCase();
  if (text.includes('af') || text.includes('autofocus') || text.includes('auto focus')) return 'Autofocus';
  if (text.includes('mf') || text.includes('manual') || text.includes('t2.0') || text.includes('t2.1') || text.includes('ciné') || text.includes('cine')) return 'Manual Focus';
  return 'Manual Focus';
}

function extractFocalLength(p) {
  const match = (p.name || '').match(/\b(\d+(?:\.\d+)?)\s*mm\b/i);
  return match ? `${match[1]}mm` : null;
}

function extractMaxAperture(p) {
  const match = (p.name || '').match(/\b(?:f|t)\/?(\d+(?:\.\d+)?)\b/i);
  return match ? `f/${match[1]}` : null;
}

function getAvailability(p) {
  const fullJsonStr = JSON.stringify(p).toLowerCase();
  if (p.isPreorder === true || p.ispreorder === true || fullJsonStr.includes('précommande') || fullJsonStr.includes('preorder')) {
    return 'PreOrder';
  }
  const inStock = p.inStock !== false && p.inStock !== 'FALSE' && p.inStock !== 'false';
  return inStock ? 'InStock' : 'OutOfStock';
}

function detectCategory(p) {
  const cat = (p.category || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  if (cat.includes('filtre') || name.includes('filter') || name.includes('filtre') || name.includes('vnd') || name.includes('cpl') || name.includes('black mist')) return 'Filtres Optiques';
  if (cat.includes('cinelenses') || name.includes('t2.0') || name.includes('t2.1') || name.includes('cine')) return 'Lentilles Cinéma';
  if (cat.includes('lenses') || name.includes('mm') || name.includes('af') || name.includes('objectif')) return 'Objectifs Photo';
  if (cat.includes('studio') || name.includes('spotlight') || name.includes('bkl') || name.includes('panel') || name.includes('ym 350')) return 'Éclairage Studio LED';
  if (cat.includes('portable') || name.includes('torche') || name.includes('rgb')) return 'Éclairage Portable & RGB';
  if (name.includes('osmo') || name.includes('pocket') || name.includes('dji') || name.includes('camera')) return 'Caméras & Stabilisateurs';
  if (name.includes('adapter') || name.includes('bague')) return 'Bagues & Adaptateurs';
  return 'Accessoires Photo & Vidéo';
}

async function generate() {
  console.log('\n🤖 Generating static AI JSON endpoints in public/ai/...\n');

  const env = loadEnv();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://gunuqwikqhtllwplzcru.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
  const baseUrl = 'https://gearshop.ma';
  const today = new Date().toISOString().split('T')[0];

  let rawProducts = [];
  try {
    const url = `${supabaseUrl}/rest/v1/products%20gearshop?select=*&order=id.asc`;
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });
    if (res.ok) {
      rawProducts = await res.json();
    }
  } catch (err) {
    console.warn(`⚠️ Supabase fetch error: ${err.message}`);
  }

  // Ensure DJI Osmo Pocket 4 Pro is present in structured products list
  const hasOsmo = rawProducts.some(p => p.id === 3001 || (p.name || '').toLowerCase().includes('pocket 4'));
  if (!hasOsmo) {
    rawProducts.push({
      id: 3001,
      name: 'DJI Osmo Pocket 4 Pro',
      price: 8000,
      category: 'Caméras & Stabilisateurs',
      brand: 'DJI',
      desc: 'Caméra compacte de vlog 4K avec double objectif (20mm & 60mm), capteur CMOS 1 pouce LOFIC (17 stops de plage dynamique), D-Log 2 10-bit et stabilisation 3 axes avec ActiveTrack 8.0.',
      image: 'https://gearshop.ma/images/products/dji-osmo-pocket-4-pro-3.png',
      inStock: true,
      isPreorder: true
    });
  }

  // Transform products into rich, structured format
  const structuredProducts = rawProducts.map(p => {
    const brand = detectBrand(p);
    const mount = detectMount(p);
    const category = detectCategory(p);
    const focalLength = extractFocalLength(p);
    const maxAperture = extractMaxAperture(p);
    const focus = detectFocus(p);
    const sensorCoverage = detectSensorCoverage(p);
    const availability = getAvailability(p);
    const isSpecialOsmo = p.id === 3001 || (p.name || '').toLowerCase().includes('pocket 4');
    const productUrl = isSpecialOsmo ? `${baseUrl}/dji-osmo-pocket-4-pro` : `${baseUrl}/product/${p.id}-${slugify(p.name)}`;

    return {
      id: p.id,
      sku: p.sku || `GEAR-${p.id}-${slugify(brand).toUpperCase()}`,
      name: p.name,
      brand: brand,
      category: category,
      mount: mount,
      focus: focus,
      sensorCoverage: sensorCoverage,
      focalLength: focalLength,
      maxAperture: maxAperture,
      condition: 'New (Neuf sous emballage d\'origine)',
      price: Number(p.price) || 0,
      currency: 'MAD',
      availability: availability,
      warranty: '1 an officiel avec SAV local à Casablanca',
      deliveryArea: 'Maroc entier (24h à 48h)',
      paymentMethods: ['Cash on Delivery (Paiement à la livraison)', 'Virement Bancaire', 'Carte Bancaire'],
      image: p.image ? (p.image.startsWith('http') ? p.image : `${baseUrl}/${p.image.replace(/^\//, '')}`) : `${baseUrl}/banner_7artisans.jpg`,
      url: productUrl,
      lastUpdated: today
    };
  });

  // Categories Map
  const categoriesMap = {};
  structuredProducts.forEach(p => {
    if (!categoriesMap[p.category]) {
      categoriesMap[p.category] = {
        name: p.category,
        count: 0,
        sampleProducts: []
      };
    }
    categoriesMap[p.category].count++;
    if (categoriesMap[p.category].sampleProducts.length < 5) {
      categoriesMap[p.category].sampleProducts.push({ name: p.name, price: p.price, url: p.url });
    }
  });

  // Brands Map
  const brandsMap = {};
  structuredProducts.forEach(p => {
    if (!brandsMap[p.brand]) {
      brandsMap[p.brand] = {
        name: p.brand,
        count: 0,
        mountsAvailable: new Set(),
        sampleProducts: []
      };
    }
    brandsMap[p.brand].count++;
    if (p.mount) brandsMap[p.brand].mountsAvailable.add(p.mount);
    if (brandsMap[p.brand].sampleProducts.length < 5) {
      brandsMap[p.brand].sampleProducts.push({ name: p.name, price: p.price, url: p.url });
    }
  });

  // Convert Set to Array in Brands Map
  const formattedBrands = Object.values(brandsMap).map(b => ({
    ...b,
    mountsAvailable: Array.from(b.mountsAvailable)
  }));

  // Master Catalog Object
  const catalog = {
    '@context': 'https://schema.org',
    entity: {
      name: 'GearShop Maroc',
      legalName: 'Soft Store Maroc',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      telephone: '+212673011873',
      email: 'contact@gearshop.ma',
      country: 'MA',
      currency: 'MAD',
      languages: ['fr-MA', 'ar-MA', 'en'],
      showroom: {
        city: 'Casablanca',
        country: 'Maroc',
        services: ['Essais d\'objectifs sur place', 'Conseils compatibilité', 'Retrait immédiat']
      },
      deliveryNetwork: {
        coverage: 'Toutes les villes et régions du Maroc',
        deliveryTimes: {
          'Casablanca & Mohammedia': 'Le jour même / 24h Express',
          'Rabat, Salé, Kénitra, Témara': '24h Express Garanti',
          'Marrakech, Tanger, Fès, Meknès, Agadir, Oujda, Nador, etc.': '24h à 48h Express'
        },
        paymentAccepted: 'Paiement en espèces à la livraison (Cash on Delivery partout au Maroc)'
      }
    },
    catalogSummary: {
      totalProducts: structuredProducts.length,
      categoriesCount: Object.keys(categoriesMap).length,
      brandsCount: formattedBrands.length,
      lastUpdated: today
    },
    endpoints: {
      fullText: `${baseUrl}/llms-full.txt`,
      discovery: `${baseUrl}/llms.txt`,
      productsJson: `${baseUrl}/ai/products.json`,
      categoriesJson: `${baseUrl}/ai/categories.json`,
      brandsJson: `${baseUrl}/ai/brands.json`,
      sitemapXml: `${baseUrl}/sitemap.xml`
    }
  };

  // Ensure public/ai directory exists
  const publicAiDir = path.join(__dirname, '..', 'public', 'ai');
  fs.mkdirSync(publicAiDir, { recursive: true });

  fs.writeFileSync(path.join(publicAiDir, 'catalog.json'), JSON.stringify(catalog, null, 2), 'utf-8');
  fs.writeFileSync(path.join(publicAiDir, 'products.json'), JSON.stringify({ ...catalog, products: structuredProducts }, null, 2), 'utf-8');
  fs.writeFileSync(path.join(publicAiDir, 'categories.json'), JSON.stringify({ ...catalog, categories: Object.values(categoriesMap) }, null, 2), 'utf-8');
  fs.writeFileSync(path.join(publicAiDir, 'brands.json'), JSON.stringify({ ...catalog, brands: formattedBrands }, null, 2), 'utf-8');

  console.log(`✅ Generated static AI JSON endpoints in public/ai/:`);
  console.log(`   📄 public/ai/catalog.json`);
  console.log(`   📄 public/ai/products.json (${structuredProducts.length} items)`);
  console.log(`   📄 public/ai/categories.json`);
  console.log(`   📄 public/ai/brands.json\n`);
}

generate().catch(err => {
  console.error('Error generating AI JSON:', err);
  process.exit(0);
});
