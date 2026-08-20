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

const BASE_URL = 'https://gearshop.ma';

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
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
  if (product.brand) return product.brand;
  const text = `${product.name || ''} ${product.category || ''} ${product.desc || ''}`.toLowerCase();
  if (text.includes('k&f') || text.includes('concept') || text.includes('kf')) return 'K&F Concept';
  if (text.includes('7artisans')) return '7Artisans';
  if (text.includes('godox')) return 'Godox';
  if (text.includes('sony')) return 'Sony';
  if (text.includes('canon')) return 'Canon';
  if (text.includes('nikon')) return 'Nikon';
  if (text.includes('fuji') || text.includes('fujifilm')) return 'Fujifilm';
  if (text.includes('panasonic') || text.includes('lumix')) return 'Panasonic';
  if (text.includes('rode') || text.includes('røde')) return 'Røde';
  if (text.includes('sandisk')) return 'SanDisk';
  if (text.includes('insta360')) return 'Insta360';
  if (text.includes('yongnuo')) return 'Yongnuo';
  return '7Artisans';
}

function getGoogleCategory(product) {
  const text = `${product.name || ''} ${product.category || ''}`.toLowerCase();
  if (text.includes('filter') || text.includes('filtre') || text.includes('vnd') || text.includes('cpl') || text.includes('black mist')) {
    return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories &gt; Camera Lens Accessories &gt; Camera Lens Filters';
  }
  if (text.includes('adapter') || text.includes('adaptateur') || text.includes('bague')) {
    return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories &gt; Lens &amp; Filter Adapters';
  }
  if (text.includes('bag') || text.includes('sac') || text.includes('backpack')) {
    return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories &gt; Camera Bags &amp; Cases';
  }
  if (text.includes('light') || text.includes('led') || text.includes('studio') || text.includes('torche') || text.includes('spotlight')) {
    return 'Cameras &amp; Optics &gt; Photography &gt; Lighting &amp; Studio';
  }
  if (text.includes('clean') || text.includes('nettoyage') || text.includes('souffleur')) {
    return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories &gt; Camera Care &amp; Cleaning';
  }
  if (text.includes('micro') || text.includes('audio') || text.includes('wireless')) {
    return 'Electronics &gt; Audio &gt; Audio Accessories &gt; Microphones';
  }
  // Default to Lenses
  return 'Cameras &amp; Optics &gt; Camera &amp; Optic Accessories &gt; Camera Lenses';
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

    products.forEach(product => {
      if (!product.id || !product.name || !product.price) return;

      const slug = slugify(product.name);
      const productUrl = `${BASE_URL}/product/${product.id}-${slug}`;
      const escapedTitle = escapeXml(product.name);
      
      let desc = product.desc || product.name;
      desc = desc.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
      const escapedDesc = escapeXml(desc).substring(0, 5000);

      let imageUrl = product.image || '';
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      else if (imageUrl.startsWith('/cdn/')) imageUrl = 'https://7artisans.store' + imageUrl;
      else if (imageUrl.startsWith('/')) imageUrl = BASE_URL + imageUrl;

      const brand = detectBrand(product);
      const googleCat = getGoogleCategory(product);
      const priceFormatted = Number(product.price).toFixed(2) + ' MAD';
      const isOccasion = (product.category || '').toLowerCase().includes('occasion') || (product.name || '').toLowerCase().includes('occasion');
      const condition = isOccasion ? 'used' : 'new';
      const availability = product.inStock !== false ? 'in_stock' : 'out_of_stock';

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
