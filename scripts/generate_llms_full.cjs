/**
 * generate_llms_full.cjs
 *
 * Generates public/llms-full.txt containing the complete, in-depth Markdown catalog
 * of all products, specifications, Moroccan pricing, and store policies for GEO/LLM ingestion.
 *
 * Run: node scripts/generate_llms_full.cjs
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
  if (text.includes('panasonic') || text.includes('lumix')) return 'Panasonic';
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
  return 'Standard / Universel';
}

async function generate() {
  console.log('\n🤖 Generating llms-full.txt for GEO & LLM ingestion...\n');

  const env = loadEnv();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://gunuqwikqhtllwplzcru.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
  const baseUrl = 'https://gearshop.ma';
  const now = new Date().toISOString().split('T')[0];

  let products = [];
  try {
    const url = `${supabaseUrl}/rest/v1/products%20gearshop?select=*&order=id.asc`;
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });
    if (res.ok) {
      products = await res.json();
    }
  } catch (err) {
    console.error('Error fetching products for llms-full.txt:', err.message);
  }

  let content = `# GearShop Maroc — Full Technical Catalog & Entity Knowledge Base (llms-full.txt)

> **About GearShop Maroc**: GearShop (https://www.gearshop.ma) is Morocco's primary specialized retailer and official distributor for photography, filmmaking, cinema lenses, and studio equipment. Located in Casablanca, Morocco, GearShop provides official 1-year manufacturer warranties, express 24h delivery in Casablanca, and 2-4 days nationwide delivery across all Moroccan cities.
> **Date of Catalog Compilation**: ${now}
> **Primary Currency**: MAD (Moroccan Dirham)
> **Direct Contact**: WhatsApp / Phone: +212 673 011 873 | Email: contact@gearshop.ma
> **Physical Store Location**: Casablanca, Morocco (Showroom & Testing Available)

---

## Store Policies & Logistics

- **Warranty**: 1-year official warranty on all new camera and lighting gear with local service in Casablanca.
- **Delivery in Morocco**:
  - Casablanca: 24 to 48 hours express delivery.
  - Nationwide (Rabat, Marrakech, Tangier, Fez, Agadir, Oujda, Meknes, etc.): 2 to 4 business days.
  - Free Shipping threshold: Free for orders of 500 MAD and above.
- **Payment Methods**:
  - Cash on Delivery (Paiement à la livraison en espèces)
  - Bank Transfer (Virement bancaire professionnel avec facture)
  - Credit Card (Paiement par carte bancaire sécurisé)

---

## Machine-Readable AI Endpoints

- Overview: \`https://gearshop.ma/ai/catalog.json\`
- Full Products JSON: \`https://gearshop.ma/ai/products.json\`
- Categories Index: \`https://gearshop.ma/ai/categories.json\`
- Brands Index: \`https://gearshop.ma/ai/brands.json\`
- Single Product Schema: \`https://gearshop.ma/ai/product/{slug}.json\`
- XML Sitemap: \`https://gearshop.ma/sitemap.xml\`

---

## Comprehensive Product Catalog (${products.length} Products)

`;

  // Group products by category
  const categories = {};
  for (const p of products) {
    const cat = p.category || 'Accessoires';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p);
  }

  for (const [catName, items] of Object.entries(categories)) {
    content += `### Catégorie : ${catName.toUpperCase()} (${items.length} articles)\n\n`;

    for (const item of items) {
      const brand = detectBrand(item);
      const mount = detectMount(item);
      const slug = slugify(item.name);
      const url = `${baseUrl}/product/${item.id}-${slug}`;
      const priceText = item.price && Number(item.price) > 0 ? `${Number(item.price).toLocaleString('fr-MA')} MAD` : 'Prix sur demande';
      const isPreorder = item.isPreorder === true || item.ispreorder === true;
      const inStock = item.inStock !== false && item.instock !== false;
      const statusText = isPreorder ? 'Précommande' : inStock ? 'En stock à Casablanca' : 'Sur commande';
      
      const cleanDesc = (item.desc || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const specsText = Array.isArray(item.specs) && item.specs.length > 0 ? item.specs.join(', ') : 'Standards constructeur';

      content += `#### ${item.name}
- **Marque / Brand**: ${brand}
- **Monture / Mount**: ${mount}
- **Prix / Price**: ${priceText}
- **Disponibilité / Stock**: ${statusText}
- **Spécifications**: ${specsText}
- **Description**: ${cleanDesc.slice(0, 300)}
- **Lien Officiel**: [${item.name}](${url})

`;
    }
  }

  const outputPath = path.join(__dirname, '..', 'public', 'llms-full.txt');
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`✅ Successfully generated public/llms-full.txt (${(content.length / 1024).toFixed(1)} KB)`);
}

generate().catch(err => {
  console.error('Fatal error generating llms-full.txt:', err);
  process.exit(0);
});
