/**
 * prerender.cjs
 *
 * Pre-renders all product pages to static HTML so Google can index them.
 *
 * Problem: This is a React SPA. When Googlebot visits /product/123-ym-350,
 * it gets an empty <div id="root"></div>. Products never get indexed.
 *
 * Solution: This script fetches all products from Supabase, then uses
 * the existing sitemap.xml to generate static HTML files in dist/
 * that contain real page content baked in (product name, price, desc).
 *
 * Usage: Called automatically via `npm run build`
 * Output: dist/product/ID-slug/index.html for each product
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Load env variables from .env.local
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
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    env[key] = value;
  }
  return env;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function fetchProducts(supabaseUrl, supabaseKey) {
  // URL-encode the table name (space → %20) and select all needed columns
  const url = `${supabaseUrl}/rest/v1/products%20gearshop?select=id,name,price,category,desc,image,inStock&order=id.asc&limit=500`;
  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Supabase fetch failed: ${response.status} ${response.statusText} — ${body}`);
  }
  return response.json();
}

function generateProductHTML(product, baseTemplate) {
  const title = `${product.name} | GearShop Maroc - Achat au Maroc`;
  const price = Number(product.price || 0).toLocaleString('fr-MA');
  const inStock = product.inStock !== false && product.inStock !== 'FALSE' && product.inStock !== 'false';
  const description = `Achetez le ${product.name} au Maroc chez GearShop. Prix: ${price} MAD. ${inStock ? 'En stock' : 'Sur commande'}. Livraison rapide à Casablanca et dans tout le Maroc.`;
  const canonicalUrl = `https://gearshop.ma/product/${product.id}-${slugify(product.name)}`;

  // Replace the title and meta description in the HTML template
  let html = baseTemplate;

  // Replace <title> tag
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${description.replace(/"/g, '&quot;')}">`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // Replace og:title
  html = html.replace(
    /<meta property="og:title"[^>]*>/,
    `<meta property="og:title" content="${product.name} | GearShop Maroc">`
  );

  // Replace og:description
  html = html.replace(
    /<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}">`
  );

  // Replace og:url
  html = html.replace(
    /<meta property="og:url"[^>]*>/,
    `<meta property="og:url" content="${canonicalUrl}">`
  );

  // Replace og:image if product has an image
  if (product.image) {
    html = html.replace(
      /<meta property="og:image"[^>]*>/,
      `<meta property="og:image" content="${product.image}">`
    );
  }

  // Inject JSON-LD into the head
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.gallery && product.gallery.length > 0 ? product.gallery : (product.image ? [product.image] : []),
    "description": description,
    "brand": {
      "@type": "Brand",
      "name": "7Artisans"
    },
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "MAD",
      "price": product.price,
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "GearShop Maroc"
      }
    }
  };

  html = html.replace(
    '</head>',
    `  <script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n  </script>\n</head>`
  );

  // Inject a prerendered content block for Google inside <body>
  // This ensures crawlers see real product content even before JS loads
  const prerenderContent = `
  <div id="prerender-seo" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
    <h1>${product.name}</h1>
    <p>${description}</p>
    <p>Catégorie: ${product.category || ''}</p>
    <p>Prix: ${price} MAD</p>
    <p>Disponibilité: ${inStock ? 'En stock' : 'Sur commande'}</p>
    <p>Vendeur: GearShop Maroc - Seul revendeur officiel 7Artisans au Maroc</p>
    ${product.image ? `<img src="${product.image}" alt="${product.name} - GearShop Maroc" title="${product.name} - GearShop Maroc" />` : ''}
  </div>
`;

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"></div>${prerenderContent}`
  );

  return html;
}

async function prerender() {
  console.log('\n🔍 Pre-renderer starting...\n');

  const env = loadEnv();
  // Check process.env first (Vercel sets these as real env vars during build)
  // Fall back to .env.local for local development
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not found (checked process.env and .env.local)');
    console.warn('    Pre-rendering will be skipped. Products will not be indexed by Google.');
    console.warn('    Fix: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Vercel env vars.\n');
    return;
  }

  console.log(`🔗 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);

  const distDir = path.join(__dirname, '..', 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ dist/index.html not found. Run `vite build` before pre-rendering.');
    process.exit(1);
  }

  const baseTemplate = fs.readFileSync(indexHtmlPath, 'utf-8');

  console.log('📡 Fetching products from Supabase...');
  let products;
  try {
    products = await fetchProducts(supabaseUrl, supabaseKey);
    console.log(`✅ Fetched ${products.length} products\n`);
  } catch (err) {
    console.error('❌ Failed to fetch products from Supabase:', err.message);
    console.warn('    Pre-rendering skipped. Build will continue without pre-rendered pages.\n');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    if (!product.id || !product.name) continue;

    const slug = slugify(product.name);
    const productDir = path.join(distDir, 'product', `${product.id}-${slug}`);

    try {
      fs.mkdirSync(productDir, { recursive: true });
      const html = generateProductHTML(product, baseTemplate);
      fs.writeFileSync(path.join(productDir, 'index.html'), html, 'utf-8');
      console.log(`  ✅ /product/${product.id}-${slug}`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ /product/${product.id}-${slug}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n🎉 Pre-rendering complete!`);
  console.log(`   ✅ ${successCount} pages pre-rendered`);
  if (errorCount > 0) console.log(`   ❌ ${errorCount} pages failed`);
  console.log('\n   Google will now be able to read real product content on each page.');
  console.log('   Expected time for Google to index: 1-4 weeks after deployment.\n');
}

prerender().catch(err => {
  console.error('Pre-render fatal error:', err);
  // Don't exit with error code — we don't want to break the build
  process.exit(0);
});
