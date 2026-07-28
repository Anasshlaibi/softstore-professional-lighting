/**
 * generate_sitemap.cjs
 *
 * Fetches all products from Supabase and regenerates public/sitemap.xml
 * so the static sitemap is always up to date with real product data.
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
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  const baseUrl = 'https://gearshop.ma';
  const today = new Date().toISOString().split('T')[0];

  let productUrls = '';

  if (supabaseUrl && supabaseKey) {
    try {
      const url = `${supabaseUrl}/rest/v1/products%20gearshop?select=id,name,image,gallery&order=id.asc&limit=500`;
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

          productUrls += `
  <url>
    <loc>${productUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${product.image ? `<image:image>
      <image:loc>${escapeXml(product.image)}</image:loc>
      <image:title>${escapeXml(product.name)} - GearShop Maroc</image:title>
      <image:caption>Achetez ${escapeXml(product.name)} chez GearShop Maroc - Seul revendeur officiel 7Artisans</image:caption>
    </image:image>` : ''}
    ${gallery.slice(0, 2).map(img => `<image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(product.name)} - Vue supplémentaire - GearShop Maroc</image:title>
    </image:image>`).join('\n    ')}
  </url>`;
        }
      } else {
        console.warn(`⚠️  Supabase returned ${response.status} — using empty product list`);
      }
    } catch (err) {
      console.warn(`⚠️  Failed to fetch from Supabase: ${err.message}`);
      console.warn('    Sitemap will be generated without dynamic product URLs.');
    }
  } else {
    console.warn('⚠️  No Supabase credentials found — generating sitemap without products');
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/banner_7artisans.jpg</image:loc>
      <image:title>GearShop Maroc - Objectifs 7Artisans et Lentilles Cinéma au Maroc</image:title>
      <image:caption>Seul revendeur officiel d'objectifs 7Artisans au Maroc - Canon, Nikon Z, Sony E</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/cinema-lenses-maroc</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/magasin-casablanca</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>${productUrls}
</urlset>`;

  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf-8');

  const productCount = (productUrls.match(/<url>/g) || []).length;
  console.log(`✅ Sitemap written to public/sitemap.xml`);
  console.log(`   📄 3 static pages + ${productCount} product pages = ${3 + productCount} total URLs\n`);
}

generateSitemap().catch(err => {
  console.error('Sitemap generation error:', err);
  process.exit(0); // Don't break the build
});
