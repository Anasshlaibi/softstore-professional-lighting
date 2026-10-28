const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

const env = loadEnv();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://gunuqwikqhtllwplzcru.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BASE_URL = 'https://www.gearshop.ma';

function slugify(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function detectBrand(product) {
  // Use explicit DB field: never derive manufacturer from compatibility/desc text
  if (product.brand && product.brand.trim()) return product.brand.trim();
  const id = Number(product.id);
  if (id >= 1000 && id < 2000) return '7Artisans';
  if (id >= 2000 && id < 3000) return 'K&F Concept';

  const nameRaw = (product.name || '').trim();
  const name = nameRaw.toLowerCase();
  if (name.includes('7artisans')) return '7Artisans';
  if (name.includes('k&f') || name.includes('kf concept')) return 'K&F Concept';
  if (name.includes('godox')) return 'Godox';
  if (name.includes('atomos')) return 'Atomos';
  if (name.includes('dji') || name.includes('osmo pocket') || name.includes('osmo mobile') || id === 3001) return 'DJI';
  if (name.includes('smallrig')) return 'SmallRig';
  if (name.includes('hollyland')) return 'Hollyland';
  if (name.includes('insta360')) return 'Insta360';
  if (name.includes('vanguard')) return 'Vanguard';
  if (name.includes('yongnuo')) return 'Yongnuo';
  if (name.includes('pny')) return 'PNY';
  if (name.includes('sandisk')) return 'SanDisk';
  if (name.includes('agfa')) return 'Agfa';
  if (name.includes('kodak')) return 'Kodak';
  if (name.includes('tamron') || id === 6040 || id === 6041) return 'Tamron';
  if (name.includes('rode') || name.includes('r\u00f8de') || name.includes('røde')) return 'Røde';
  if (/^sony\b/i.test(nameRaw) || (name.includes('sony') && !name.includes('mount'))) return 'Sony';
  if (/^canon\b/i.test(nameRaw) || (name.includes('canon') && !name.includes('mount') && !name.includes('eos-r'))) return 'Canon';
  if (/^nikon\b/i.test(nameRaw) || (name.includes('nikon') && !name.includes('mount'))) return 'Nikon';
  if (/^fuji/i.test(nameRaw) || (name.includes('fujifilm') && !name.includes('mount'))) return 'Fujifilm';
  if (name.includes('panasonic') || name.includes('lumix')) return 'Panasonic';
  // DO NOT default to 7Artisans for unknown products
  return '';
}

function getGoogleCategory(product) {
  const name = (product.name || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();
  const text = name + ' ' + cat;

  // Camera bodies & action cameras — check BEFORE lenses to avoid false classification
  if (text.includes('boitier') || text.includes('bo\u00eetier') || text.includes('body') ||
      text.includes('eos r') || text.includes('alpha') || text.includes('zv-e') ||
      text.includes('z5 ') || text.includes('z6 ') || text.includes('z8') || text.includes('z9') ||
      text.includes('pocket 3') || text.includes('pocket 4') ||
      text.includes('ace pro') || text.includes('insta360 x') ||
      text.includes('cinema line') || text.includes('canon xa') ||
      cat.includes('camera') || cat.includes('cam\u00e9ra') || cat.includes('appareil photo')) {
    return 'Cameras &amp; Optics &gt; Cameras &gt; Digital Cameras';
  }

  // Gimbals / stabilizers
  if (text.includes('gimbal') || text.includes('stabilisateur') || text.includes('osmo mobile') ||
      text.includes('flow 2') || cat.includes('stabilisateur')) {
    return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories &gt; Tripods &amp; Monopods';
  }

  // Filters
  if (text.includes('filter') || text.includes('filtre') || text.includes('vnd') ||
      text.includes('cpl') || text.includes('black mist') || text.includes('uv filter')) {
    return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories &gt; Camera Lens Accessories &gt; Camera Lens Filters';
  }

  // Lens adapters
  if (text.includes('adapter') || text.includes('adaptateur') || text.includes('bague')) {
    return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories &gt; Lens &amp; Filter Adapters';
  }

  // Camera bags
  if (text.includes('bag') || text.includes('sac') || text.includes('backpack') || text.includes('valise')) {
    return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories &gt; Camera Bags &amp; Cases';
  }

  // Lighting
  if (text.includes('light') || text.includes(' led') || cat.includes('studio') || cat.includes('portable') ||
      text.includes('torche') || text.includes('spotlight') || text.includes('flash') ||
      text.includes('softbox') || text.includes('godox')) {
    return 'Cameras &amp; Optics &gt; Photography &gt; Lighting &amp; Studio';
  }

  // Memory cards / storage
  if (text.includes('carte') || text.includes('card') || text.includes('ssd') || text.includes('cfe')) {
    return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories &gt; Memory Card Readers';
  }

  // Audio
  if (text.includes('micro') || text.includes('audio') || text.includes('wireless') ||
      text.includes('lark') || text.includes('solidcom')) {
    return 'Electronics &gt; Audio &gt; Audio Accessories &gt; Microphones';
  }

  // Tripods / rigging
  if (text.includes('tripod') || text.includes('tr\u00e9pied') || text.includes('cage') ||
      text.includes('smallrig') || text.includes('matte box')) {
    return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories &gt; Tripods &amp; Monopods';
  }

  // Lenses (default for optique-category products)
  if (cat.includes('objectif') || cat.includes('lenses') || cat.includes('lens') ||
      /\d+mm/.test(name)) {
    return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories &gt; Camera Lenses';
  }

  // Final safe default — Camera Accessories (not Lenses)
  return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories';
}

async function generateMerchantFeed() {
  try {
    console.log('Fetching all products from Supabase for Google Merchant Center feed...');
    const { data: products, error } = await supabase
      .from('products gearshop')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    console.log(`Fetched ${products.length} products from Supabase.`);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>GearShop Maroc - Google Merchant Feed</title>
    <link>${BASE_URL}</link>
    <description>Distribution de Matériel Photo, Optiques Cinéma &amp; Accessoires Professionnels au Maroc</description>
`;

    let skippedCount = 0;
    products.forEach(product => {
      // GUARD 1: Skip zero-price products — Google rejects 0.00 MAD offers
      if (!product.price || Number(product.price) <= 0) {
        console.warn(`  [SKIPPED] ID ${product.id} "${product.name}" — price is 0 or missing. Fix in DB before including.`);
        skippedCount++;
        return;
      }
      if (!product.id || !product.name || !product.price) return;

      const isOsmoPocket4 = product.id === 3001 || (product.name || '').toLowerCase().includes('osmo pocket 4');
      const slug = slugify(product.name);
      const productUrl = isOsmoPocket4
        ? `${BASE_URL}/dji-osmo-pocket-4-pro`
        : `${BASE_URL}/product/${product.id}-${slug}`;
      const escapedTitle = escapeXml(isOsmoPocket4 ? 'DJI Osmo Pocket 4P (Pro)' : product.name);
      
      let desc = product.desc || product.name;
      desc = desc.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
      const escapedDesc = escapeXml(desc).substring(0, 5000);

      let imageUrl = isOsmoPocket4
        ? '/images/products/dji-osmo-pocket-4-pro.webp'
        : product.image || '';
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      else if (imageUrl.startsWith('/cdn/')) imageUrl = 'https://7artisans.store' + imageUrl;
      else if (imageUrl.startsWith('/')) imageUrl = BASE_URL + imageUrl;

      const brand = detectBrand(product);
      const googleCat = getGoogleCategory(product);
      const priceFormatted = Number(product.price).toFixed(2) + ' MAD';
      const isOccasion = (product.category || '').toLowerCase().includes('occasion') || (product.name || '').toLowerCase().includes('occasion');
      const condition = isOccasion ? 'used' : 'new';
      const isPreorder = isOsmoPocket4 || product.isPreorder === true || product.ispreorder === true || product.status === 'Précommande';
      const availability = isPreorder ? 'preorder' : product.inStock !== false ? 'in_stock' : 'out_of_stock';

      xml += `    <item>
      <g:id>${product.id}</g:id>
      <g:title>${escapedTitle}</g:title>
      <g:description>${escapedDesc}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${priceFormatted}</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:google_product_category>${googleCat}</g:google_product_category>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>MA</g:country>
        <g:service>Livraison Express Maroc</g:service>
        <g:price>0.00 MAD</g:price>
      </g:shipping>
    </item>\n`;
    });

    xml += `  </channel>\n</rss>`;

    const outputPath = path.join(__dirname, '..', 'public', 'google-merchant-feed.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');
    console.log(`✅ Successfully generated Google Merchant Feed with ${products.length} products to ${outputPath}`);
  } catch (err) {
    console.error('Error generating Merchant feed:', err);
    process.exit(1);
  }
}

generateMerchantFeed();
