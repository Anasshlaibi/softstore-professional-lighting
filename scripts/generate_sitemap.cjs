/**
 * generate_sitemap.cjs
 *
 * Fetches all products from Supabase and regenerates public/sitemap.xml
 * so the static sitemap is always up to date with real product, brand,
 * category, and use-case landing page URLs.
 *
 * Run: node scripts/generate_sitemap.cjs
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

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateSitemap() {
  console.log('\n🗺️  Sitemap generator starting...\n');

  const env = loadEnv();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://gunuqwikqhtllwplzcru.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
  const baseUrl = 'https://gearshop.ma';
  const today = new Date().toISOString().split('T')[0];

  let productUrls = '';

  if (supabaseUrl && supabaseKey) {
    try {
      const url = `${supabaseUrl}/rest/v1/products%20gearshop?select=id,name,image,gallery&order=id.asc`;
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      if (response.ok) {
        const products = await response.json();
        console.log(`✅ Fetched ${products.length} products from Supabase`);

        for (const product of products) {
          if (!product.id || !product.name) continue;
          const slug = slugify(product.name);
          const productUrl = `${baseUrl}/product/${product.id}-${slug}`;

          // Parse gallery
          let gallery = [];
          if (product.gallery) {
            if (Array.isArray(product.gallery)) {
              gallery = product.gallery;
            } else {
              try { gallery = JSON.parse(product.gallery); } catch { gallery = []; }
            }
          }

          // Helper to get absolute image URL
          const getAbsoluteImageUrl = (img) => {
            if (!img) return '';
            if (img.startsWith('http')) return img;
            if (img.startsWith('//')) return 'https:' + img;
            if (img.startsWith('/cdn/')) return 'https://7artisans.store' + img;
            return baseUrl + (img.startsWith('/') ? img : '/' + img);
          };

          productUrls += `
  <url>
    <loc>${productUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${product.image ? `<image:image>
      <image:loc>${escapeXml(getAbsoluteImageUrl(product.image))}</image:loc>
      <image:title>${escapeXml(product.name)} - GearShop Maroc</image:title>
      <image:caption>Achetez ${escapeXml(product.name)} chez GearShop Maroc - Distributeur officiel</image:caption>
    </image:image>` : ''}
    ${gallery.slice(0, 2).map(img => `<image:image>
      <image:loc>${escapeXml(getAbsoluteImageUrl(img))}</image:loc>
      <image:title>${escapeXml(product.name)} - Vue supplémentaire - GearShop Maroc</image:title>
    </image:image>`).join('\n    ')}
  </url>`;
        }
      } else {
        console.warn(`⚠️  Supabase returned ${response.status} — using static catalog urls`);
      }
    } catch (err) {
      console.warn(`⚠️  Failed to fetch from Supabase: ${err.message}`);
    }
  }

  const staticLandingPages = [
    { url: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { url: `${baseUrl}/camera-maroc`, priority: '0.98', changefreq: 'daily' },
    { url: `${baseUrl}/cinema-lenses-maroc`, priority: '0.9', changefreq: 'weekly' },
    { url: `${baseUrl}/dji-osmo-pocket-4-pro`, priority: '0.95', changefreq: 'daily' },
    { url: `${baseUrl}/magasin-casablanca`, priority: '0.85', changefreq: 'monthly' },
    { url: `${baseUrl}/a-propos`, priority: '0.8', changefreq: 'monthly' },
  ];

  const brandPages = [
    '7artisans', 'kf-concept', 'sony', 'canon', 'nikon', 'panasonic', 'lumix', 'fujifilm', 'dji', 'godox', 'rode'
  ].map(b => ({
    url: `${baseUrl}/marque/${b}`,
    priority: '0.85',
    changefreq: 'weekly',
  }));

  const categoryPages = [
    'objectifs', 'filtres', 'eclairage-studio', 'eclairage-portable', 'accessoires', 'occasion'
  ].map(c => ({
    url: `${baseUrl}/categorie/${c}`,
    priority: '0.85',
    changefreq: 'weekly',
  }));

  const guidePages = [
    'filmmakers', 'videographers', 'content-creators', 'photographers', 'interviews', 'weddings'
  ].map(g => ({
    url: `${baseUrl}/guide/${g}`,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const allStructuredPages = [
    ...staticLandingPages,
    ...categoryPages,
    ...brandPages,
    ...guidePages,
  ];

  const staticXmlEntries = allStructuredPages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${staticXmlEntries.trim()}${productUrls}
</urlset>`;

  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf-8');

  const productCount = (productUrls.match(/<url>/g) || []).length;
  console.log(`✅ Sitemap written to public/sitemap.xml`);
  console.log(`   📄 ${allStructuredPages.length} landing/category/brand pages + ${productCount} product pages = ${allStructuredPages.length + productCount} total URLs\n`);
}

generateSitemap().catch(err => {
  console.error('Sitemap generation error:', err);
  process.exit(0);
});
