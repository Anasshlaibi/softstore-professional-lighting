/**
 * prerender.cjs
 *
 * Pre-renders all product, brand, category, guide, and landing pages to static HTML
 * so search engines (Google, Bing) and AI crawlers can index real HTML with meta tags,
 * semantic H1/specs/breadcrumbs, and JSON-LD structured data.
 *
 * Usage: Called automatically via `npm run build`
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
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function fetchProducts(supabaseUrl, supabaseKey) {
  const url = `${supabaseUrl}/rest/v1/products%20gearshop?select=*&order=id.asc`;
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
  const fullJsonStr = JSON.stringify(product).toLowerCase();
  const isPreorder = product.isPreorder === true ||
    product.ispreorder === true ||
    product.status === 'Précommande' ||
    fullJsonStr.includes('précommande') ||
    fullJsonStr.includes('preorder');

  const inStock = product.inStock !== false && product.inStock !== 'FALSE' && product.inStock !== 'false';
  const hasRealPrice = product.price && Number(product.price) > 0;
  const priceFormatted = hasRealPrice ? `${Number(product.price).toLocaleString('fr-MA')} DH` : 'Sur demande';

  // Brand extraction without defaulting unknown to 7Artisans
  let brand = product.brand;
  if (!brand) {
    const nameLower = (product.name || '').toLowerCase();
    if (nameLower.includes('dji') || fullJsonStr.includes('dji')) brand = 'DJI';
    else if (nameLower.includes('tamron') || fullJsonStr.includes('tamron')) brand = 'Tamron';
    else if (nameLower.includes('sony') || fullJsonStr.includes('sony')) brand = 'Sony';
    else if (nameLower.includes('canon') || fullJsonStr.includes('canon')) brand = 'Canon';
    else if (nameLower.includes('nikon') || fullJsonStr.includes('nikon')) brand = 'Nikon';
    else if (nameLower.includes('k&f') || nameLower.includes('kf concept') || nameLower.includes('concept')) brand = 'K&F Concept';
    else if (nameLower.includes('7artisans')) brand = '7Artisans';
    else if (nameLower.includes('godox')) brand = 'Godox';
    else if (nameLower.includes('fuji') || nameLower.includes('fujifilm')) brand = 'Fujifilm';
    else if (nameLower.includes('lumix') || nameLower.includes('panasonic')) brand = 'Panasonic';
    else if (nameLower.includes('rode') || nameLower.includes('røde')) brand = 'Røde';
  }

  const isTamronA063 = Number(product.id) === 6040;
  const isNikonZrTamronPack = Number(product.id) === 6041;
  const title = product.seo_title || (isTamronA063
    ? 'Tamron 28-75mm f/2.8 G2 Nikon Z en stock au Maroc | 11 500 DH'
    : isNikonZrTamronPack
    ? 'Pack Nikon ZR + Tamron 28-75mm f/2.8 au Maroc | 31 500 DH'
    : `${product.name} | ${product.category || 'GearShop'} Maroc`);
  const description = product.meta_description || (isTamronA063
    ? 'Tamron 28-75mm f/2.8 G2 Nikon Z en stock chez GearShop : 11 500 DH. Zoom plein format, autofocus VXD et livraison au Maroc depuis Casablanca.'
    : isNikonZrTamronPack
    ? 'Pack Nikon ZR + Tamron 28-75mm f/2.8 Nikon Z à 31 500 DH chez GearShop. Économisez 499 DH, disponible à Casablanca avec livraison au Maroc.'
    : `Achetez ${product.name} chez GearShop Maroc. Prix: ${priceFormatted}. ${isPreorder ? 'Disponible en précommande chez GearShop Maroc' : inStock ? 'En stock à Casablanca' : 'Sur commande'}. Garantie 1 an.`);
  const canonicalUrl = `https://www.gearshop.ma/product/${product.id}-${slugify(product.name)}`;

  let availability = 'https://schema.org/InStock';
  if (isPreorder) {
    availability = 'https://schema.org/PreOrder';
  } else if (!inStock) {
    availability = 'https://schema.org/OutOfStock';
  }

  let html = baseTemplate;

  // Replace <title> tag
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  // Replace meta description
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">`);

  // Replace canonical
  html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonicalUrl}" />`);
  html = html.replace(/<link rel="alternate" hreflang="fr-MA"[^>]*>/, `<link rel="alternate" hreflang="fr-MA" href="${canonicalUrl}" />`);
  html = html.replace(/<link rel="alternate" hreflang="x-default"[^>]*>/, `<link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`);

  // Replace og:title
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}">`);

  // Replace og:description
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}">`);

  // Replace og:url
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonicalUrl}">`);

  // Replace og:image -- always use absolute URL
  if (product.image) {
    const absOgImage = product.image.startsWith('http') ? product.image : 'https://www.gearshop.ma' + product.image;
    html = html.replace(/<meta property="og:image"[^>]*>/, '<meta property="og:image" content="' + absOgImage + '">');
    html = html.replace(/<meta property="og:image:alt"[^>]*>/, `<meta property="og:image:alt" content="${escapeHtml(product.name)}">`);
  }

  // Parse gallery safely — force all to absolute URLs
  const toAbsolute = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://www.gearshop.ma${url}`;
  };
  let galleryImages = [product.image].filter(Boolean).map(toAbsolute);
  if (product.gallery) {
    let raw = product.gallery;
    if (!Array.isArray(raw)) {
      try { raw = JSON.parse(raw); } catch (e) { raw = []; }
    }
    if (Array.isArray(raw) && raw.length > 0) {
      galleryImages = [...new Set([product.image, ...raw].filter(Boolean).map(toAbsolute))];
    }
  }
  const primaryImageUrl = galleryImages[0] || '';

  // Keep social previews aligned with the canonical product page and primary image.
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${escapeHtml(title)}">`);
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${escapeHtml(description)}">`);
  html = html.replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${primaryImageUrl}">`);
  html = html.replace(/<meta name="twitter:image:alt"[^>]*>/, `<meta name="twitter:image:alt" content="${escapeHtml(product.name)}">`);
  if (/<meta name="twitter:url"[^>]*>/.test(html)) {
    html = html.replace(/<meta name="twitter:url"[^>]*>/, `<meta name="twitter:url" content="${canonicalUrl}">`);
  } else {
    html = html.replace('</head>', `  <meta name="twitter:url" content="${canonicalUrl}">\n</head>`);
  }

  // Inject JSON-LD into head without fabricated SKUs or 0 MAD price
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": galleryImages,
    "description": description,
    ...(brand ? {
      "brand": {
        "@type": "Brand",
        "name": brand
      }
    } : {}),
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "MAD",
      ...(hasRealPrice ? { "price": product.price.toString() } : {}),
      "availability": availability,
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "MA" },
        "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "MAD" },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "MA",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnInStore",
        "returnFees": "https://schema.org/FreeReturn"
      },
      "seller": {
        "@type": "Organization",
        "name": "GearShop Maroc"
      }
    }
  };

  html = html.replace(
    '</head>',
    `  <script type="application/ld+json" data-gearshop-schema="product">\n${JSON.stringify(jsonLd)}\n  </script>\n</head>`
  );

  // Inject visible semantic HTML for Googlebot-Image and zero-JS crawlers
  // NOTE: React will hydrate and replace this on first render
  const specsList = Array.isArray(product.specs) ? product.specs.map(s => `<li>${escapeHtml(s)}</li>`).join('') : '';
  const availabilityText = isPreorder ? 'Précommande officielle' : inStock ? 'En stock à Casablanca — Livraison 24h/48h au Maroc' : 'Rupture temporaire — Sur commande';
  const galleryHtml = galleryImages.map((imageUrl, index) => `
      <figure style="margin:0;">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(`${product.name} — vue ${index + 1}`)}" width="1200" height="1200" loading="${index === 0 ? 'eager' : 'lazy'}" />
        <figcaption>${escapeHtml(`${product.name} — vue ${index + 1}`)}</figcaption>
      </figure>`).join('');

  const semanticBodyHtml = `
  <!-- Prerendered product snapshot for crawlers; React hydrates #root -->
  <section
    id="prerendered-product-seo"
    data-prerendered="true"
    style="max-width:72rem;margin:2rem auto;padding:1.5rem;font-family:system-ui,sans-serif;color:#111;background:#fff;"
  >
    <nav aria-label="Fil d’Ariane"><a href="https://www.gearshop.ma/">Accueil</a> / <a href="https://www.gearshop.ma/categorie/${slugify(product.category || 'materiel')}">${escapeHtml(product.category || 'Matériel')}</a> / ${escapeHtml(product.name)}</nav>
    <h1>${escapeHtml(product.name)}</h1>
    <div aria-label="Images produit" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">${galleryHtml}</div>
    <p>${escapeHtml(description)}</p>
    <p>Prix&nbsp;: ${priceFormatted}</p>
    <p>Disponibilité&nbsp;: ${availabilityText}</p>
    <p>Livraison&nbsp;: Casablanca 24 h ; Rabat, Marrakech et reste du Maroc 24–48 h.</p>
    ${brand ? `<p>Marque&nbsp;: ${escapeHtml(brand)}</p>` : ''}
    ${product.category ? `<p>Catégorie&nbsp;: ${escapeHtml(product.category)}</p>` : ''}
    ${specsList ? `<ul>${specsList}</ul>` : ''}
  </section>
`;

  html = html.replace('<div id="root"></div>', `<div id="root">${semanticBodyHtml}</div>`);

  return html;
}

async function prerender() {
  console.log('\n🔍 Pre-renderer starting...\n');

  const env = loadEnv();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://gunuqwikqhtllwplzcru.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';

  const distDir = path.join(__dirname, '..', 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ dist/index.html not found. Run `vite build` before pre-rendering.');
    process.exit(1);
  }

  const baseTemplate = fs.readFileSync(indexHtmlPath, 'utf-8');
  let successCount = 0;
  let errorCount = 0;

  // Helper to prerender a specific page route
  const writeStaticPage = (subPath, title, desc, extraJsonLd = null, semanticBody = '', options = {}) => {
    const pageDir = path.join(distDir, subPath);
    try {
      fs.mkdirSync(pageDir, { recursive: true });
      let html = baseTemplate;
      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
      html = html.replace(/<meta\s+name="description"[\s\S]*?>/i, `<meta name="description" content="${desc.replace(/"/g, '&quot;')}">`);
      const canonicalUrl = options.canonicalUrl || `https://www.gearshop.ma/${subPath}`;
      html = html.replace(/<link\s+rel="canonical"[\s\S]*?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
      html = html.replace(/<link\s+rel="alternate"\s+hreflang="fr-MA"[\s\S]*?>/i, `<link rel="alternate" hreflang="fr-MA" href="${canonicalUrl}" />`);
      html = html.replace(/<link\s+rel="alternate"\s+hreflang="x-default"[\s\S]*?>/i, `<link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`);
      html = html.replace(/<meta\s+property="og:title"[\s\S]*?>/i, `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}">`);
      html = html.replace(/<meta\s+property="og:description"[\s\S]*?>/i, `<meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">`);
      html = html.replace(/<meta\s+property="og:url"[\s\S]*?>/i, `<meta property="og:url" content="${canonicalUrl}">`);
      html = html.replace(/<meta\s+name="twitter:title"[\s\S]*?>/i, `<meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}">`);
      html = html.replace(/<meta\s+name="twitter:description"[\s\S]*?>/i, `<meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}">`);
      if (options.image) {
        html = html.replace(/<meta\s+property="og:image"[\s\S]*?>/i, `<meta property="og:image" content="${options.image}">`);
        html = html.replace(/<meta\s+name="twitter:image"[\s\S]*?>/i, `<meta name="twitter:image" content="${options.image}">`);
      }
      if (options.twitterUrl) {
        html = html.replace('</head>', `  <meta name="twitter:url" content="${canonicalUrl}">\n</head>`);
      }

      if (extraJsonLd) {
        html = html.replace('</head>', `  <script type="application/ld+json">\n${JSON.stringify(extraJsonLd)}\n  </script>\n</head>`);
      }

      if (semanticBody) {
        html = html.replace('<div id="root"></div>', `<div id="root">${semanticBody}</div>`);
      }

      fs.writeFileSync(path.join(pageDir, 'index.html'), html, 'utf-8');
      console.log(`  ✅ /${subPath}`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ /${subPath}: ${err.message}`);
      errorCount++;
    }
  };

  // 1. Static Landing Pages
  console.log('📄 Pre-rendering Static Landing Pages...');
  writeStaticPage('camera-maroc', 'Caméra Maroc | Achat Caméra Photo, Vidéo & Vlogging à Casablanca | GearShop', 'Achetez votre caméra au Maroc chez GearShop. Caméras 4K nomades DJI, caméras cinéma, objectifs photo et vidéo avec garantie 1 an et livraison 24h à Casablanca.');
  writeStaticPage('cameras-maroc', 'Caméras au Maroc | Matériel Vidéo & Appareils Photo | GearShop Casablanca', 'Boutique spécialisée en caméras et matériel de tournage au Maroc. Caméras vlogging, boîtiers hybrides et lentilles cinéma.');
  writeStaticPage('cinema-lenses-maroc', 'Lentilles Cinéma Maroc | Objectifs Ciné Professionnels | GearShop', 'Gamme complète d\'objectifs cinéma 7Artisans T2.0 pour Sony E, Nikon Z, Canon RF et Lumix L-Mount au Maroc.');
  writeStaticPage('magasin-casablanca', 'Magasin Photo & Vidéo Casablanca | Showroom GearShop Maroc', 'Visitez notre magasin physique à Casablanca. Essais d\'objectifs, conseils personnalisés et stock disponible immédiatement.');
  writeStaticPage('a-propos', 'À Propos & Partenariats | GearShop Maroc', 'Découvrez l\'histoire de GearShop Maroc, distributeur officiel 7Artisans et K&F Concept avec garantie constructeur 1 an.');

  // 1b. Dedicated Pre-rendering for DJI Osmo Pocket 4 Pro
  console.log('📷 Pre-rendering DJI Osmo Pocket 4 Pro with Product & FAQ Schema...');
  const osmoJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "DJI Osmo Pocket 4P (Pro)",
    "alternateName": ["DJI Osmo Pocket 4P", "DJI Pocket 4 Pro Maroc", "Caméra DJI Maroc"],
    "image": ["https://www.gearshop.ma/images/products/dji-osmo-pocket-4-pro.webp"],
    "description": "Découvrez le DJI Osmo Pocket 4P au Maroc chez GearShop. Prix en MAD, garantie 1 an et livraison à Casablanca, Rabat, Marrakech et partout au Maroc.",
    "brand": { "@type": "Brand", "name": "DJI" },
    "offers": {
      "@type": "Offer",
      "url": "https://www.gearshop.ma/dji-osmo-pocket-4-pro",
      "priceCurrency": "MAD",
      "price": "8000",
      "availability": "https://schema.org/PreOrder",
      "itemCondition": "https://schema.org/NewCondition",
      "areaServed": { "@type": "Country", "name": "Maroc" },
      "seller": { "@type": "Organization", "name": "GearShop Maroc", "telephone": "+212673011873" },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "MAD" },
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "MA" },
        "deliveryTime": { "@type": "ShippingDeliveryTime", "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" }, "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" } }
      },
      "hasMerchantReturnPolicy": { "@type": "MerchantReturnPolicy", "applicableCountry": "MA", "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow", "merchantReturnDays": 7, "returnMethod": "https://schema.org/ReturnInStore", "returnFees": "https://schema.org/FreeReturn" }
    }
  };

  const osmoSemanticBody = `
  <section id="prerendered-product-seo" style="max-width:72rem;margin:2rem auto;padding:1.5rem;font-family:system-ui,sans-serif;color:#111;background:#fff;">
    <img src="https://www.gearshop.ma/images/products/dji-osmo-pocket-4-pro.webp" alt="DJI Osmo Pocket 4P (Pro) au Maroc" width="1024" height="1024" />
    <h1>DJI Osmo Pocket 4P (Pro) au Maroc</h1>
    <p>Découvrez le DJI Osmo Pocket 4P au Maroc chez GearShop. Prix en MAD, garantie 1 an et livraison à Casablanca, Rabat, Marrakech et partout au Maroc.</p>
    <p>Capteur CMOS 1 pouce LOFIC, plage dynamique de 17 stops, téléobjectif moyen 60mm f/1.8, D-Log 2 10-bit et stabilisation 3 axes.</p>
    <p>Livraison express en 24h à Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir et partout au Maroc avec paiement à la livraison et garantie 1 an.</p>
  </section>`;

  writeStaticPage(
    'dji-osmo-pocket-4-pro',
    'DJI Osmo Pocket 4P (Pro) au Maroc – Prix & Précommande | GearShop',
    'Découvrez le DJI Osmo Pocket 4P au Maroc chez GearShop. Prix en MAD, garantie 1 an et livraison à Casablanca, Rabat, Marrakech et partout au Maroc.',
    osmoJsonLd,
    osmoSemanticBody,
    { canonicalUrl: 'https://www.gearshop.ma/dji-osmo-pocket-4-pro', image: 'https://www.gearshop.ma/images/products/dji-osmo-pocket-4-pro.webp', twitterUrl: true }
  );

  // 1c. Pre-rendering for Pan-Morocco City Hubs
  console.log('\n🇲🇦 Pre-rendering Pan-Morocco City Hub Pages (All 12 Regions)...');
  const moroccanCitiesList = [
    // 1. Casablanca-Settat
    { slug: 'casablanca', name: 'Casablanca', region: 'Casablanca-Settat', time: 'Le jour même / 24h Express' },
    { slug: 'mohammedia', name: 'Mohammedia', region: 'Casablanca-Settat', time: '24h Express / Le jour même' },
    { slug: 'bouskoura', name: 'Bouskoura', region: 'Casablanca-Settat', time: 'Livraison le jour même / Express' },
    { slug: 'dar-bouazza', name: 'Dar Bouazza', region: 'Casablanca-Settat', time: 'Livraison le jour même / Express' },
    { slug: 'nouaceur', name: 'Nouaceur', region: 'Casablanca-Settat', time: '24h Express' },
    { slug: 'settat', name: 'Settat', region: 'Casablanca-Settat', time: '24h Express' },
    { slug: 'berrechid', name: 'Berrechid', region: 'Casablanca-Settat', time: '24h Express' },
    { slug: 'el-jadida', name: 'El Jadida', region: 'Casablanca-Settat', time: '24h Express' },
    { slug: 'benslimane', name: 'Benslimane', region: 'Casablanca-Settat', time: '24h Express' },

    // 2. Rabat-Salé-Kénitra
    { slug: 'rabat', name: 'Rabat', region: 'Rabat-Salé-Kénitra', time: '24h Express Garanti' },
    { slug: 'sale', name: 'Salé', region: 'Rabat-Salé-Kénitra', time: '24h Express' },
    { slug: 'temara', name: 'Témara', region: 'Rabat-Salé-Kénitra', time: '24h Express' },
    { slug: 'kenitra', name: 'Kénitra', region: 'Rabat-Salé-Kénitra', time: '24h Express' },
    { slug: 'sidi-kacem', name: 'Sidi Kacem', region: 'Rabat-Salé-Kénitra', time: '24h - 48h' },
    { slug: 'sidi-slimane', name: 'Sidi Slimane', region: 'Rabat-Salé-Kénitra', time: '24h - 48h' },
    { slug: 'khemisset', name: 'Khémisset', region: 'Rabat-Salé-Kénitra', time: '24h Express' },

    // 3. Marrakech-Safi
    { slug: 'marrakech', name: 'Marrakech', region: 'Marrakech-Safi', time: '24h Express' },
    { slug: 'safi', name: 'Safi', region: 'Marrakech-Safi', time: '24h - 48h' },
    { slug: 'essaouira', name: 'Essaouira', region: 'Marrakech-Safi', time: '24h - 48h' },
    { slug: 'el-kelaa-des-sraghna', name: 'El Kelâa des Sraghna', region: 'Marrakech-Safi', time: '24h - 48h' },
    { slug: 'ben-guerir', name: 'Ben Guerir', region: 'Marrakech-Safi', time: '24h Express' },

    // 4. Tanger-Tétouan-Al Hoceïma
    { slug: 'tanger', name: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma', time: '24h Express' },
    { slug: 'tetouan', name: 'Tétouan', region: 'Tanger-Tétouan-Al Hoceïma', time: '24h - 48h' },
    { slug: 'larache', name: 'Larache', region: 'Tanger-Tétouan-Al Hoceïma', time: '24h - 48h' },
    { slug: 'chefchaouen', name: 'Chefchaouen', region: 'Tanger-Tétouan-Al Hoceïma', time: '24h - 48h' },
    { slug: 'al-hoceima', name: 'Al Hoceïma', region: 'Tanger-Tétouan-Al Hoceïma', time: '48h Express' },
    { slug: 'asilah', name: 'Asilah', region: 'Tanger-Tétouan-Al Hoceïma', time: '24h Express' },

    // 5. Fès-Meknès
    { slug: 'fes', name: 'Fès', region: 'Fès-Meknès', time: '24h Express' },
    { slug: 'meknes', name: 'Meknès', region: 'Fès-Meknès', time: '24h Express' },
    { slug: 'taza', name: 'Taza', region: 'Fès-Meknès', time: '24h - 48h' },
    { slug: 'ifrane', name: 'Ifrane', region: 'Fès-Meknès', time: '24h Express' },

    // 6. Souss-Massa
    { slug: 'agadir', name: 'Agadir', region: 'Souss-Massa', time: '24h - 48h Express' },
    { slug: 'taroudant', name: 'Taroudant', region: 'Souss-Massa', time: '48h Express' },
    { slug: 'tiznit', name: 'Tiznit', region: 'Souss-Massa', time: '48h Express' },

    // 7. L'Oriental
    { slug: 'oujda', name: 'Oujda', region: 'L\'Oriental', time: '24h - 48h' },
    { slug: 'nador', name: 'Nador', region: 'L\'Oriental', time: '24h - 48h' },
    { slug: 'berkane', name: 'Berkane', region: 'L\'Oriental', time: '24h - 48h' },
    { slug: 'taourirt', name: 'Taourirt', region: 'L\'Oriental', time: '48h Express' },

    // 8. Béni Mellal-Khénifra
    { slug: 'beni-mellal', name: 'Béni Mellal', region: 'Béni Mellal-Khénifra', time: '24h - 48h' },
    { slug: 'khouribga', name: 'Khouribga', region: 'Béni Mellal-Khénifra', time: '24h Express' },
    { slug: 'khenifra', name: 'Khénifra', region: 'Béni Mellal-Khénifra', time: '48h Express' },

    // 9. Drâa-Tafilalet
    { slug: 'ouarzazate', name: 'Ouarzazate', region: 'Drâa-Tafilalet', time: '48h Express Sécurisé' },
    { slug: 'errachidia', name: 'Errachidia', region: 'Drâa-Tafilalet', time: '48h Express' },
    { slug: 'tinghir', name: 'Tinghir', region: 'Drâa-Tafilalet', time: '48h Express' },

    // 10. Guelmim-Oued Noun
    { slug: 'guelmim', name: 'Guelmim', region: 'Guelmim-Oued Noun', time: '48h Express Sécurisé' },

    // 11. Laâyoune-Sakia El Hamra
    { slug: 'laayoune', name: 'Laâyoune', region: 'Laâyoune-Sakia El Hamra', time: '48h Express Sécurisé' },

    // 12. Dakhla-Oued Ed-Dahab
    { slug: 'dakhla', name: 'Dakhla', region: 'Dakhla-Oued Ed-Dahab', time: '48h Express Sécurisé' },
  ];

  for (const c of moroccanCitiesList) {
    const cityTitle = `Matériel Photo & DJI à ${c.name} | Livraison GearShop`;
    const cityDesc = `Achetez votre matériel photo, vidéo, caméras DJI Osmo Pocket 4 Pro et objectifs 7Artisans à ${c.name} (${c.region}). Livraison ${c.time}, garantie 1 an, paiement à la livraison.`;
    const cityUrl = `https://www.gearshop.ma/livraison-maroc/${c.slug}`;
    const cityJsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${cityUrl}#webpage`,
          "url": cityUrl,
          "name": cityTitle,
          "inLanguage": ["fr-MA", "en"],
          "about": { "@id": "https://www.gearshop.ma/#business" },
          "breadcrumb": { "@id": `${cityUrl}#breadcrumb` }
        },
        {
          "@type": "Service",
          "@id": `${cityUrl}#delivery-service`,
          "name": `Livraison de matériel photo et vidéo à ${c.name}`,
          "serviceType": "Livraison de matériel photo, vidéo et cinéma",
          "provider": { "@id": "https://www.gearshop.ma/#business" },
          "areaServed": {
            "@type": "City",
            "name": c.name,
            "containedInPlace": { "@type": "AdministrativeArea", "name": c.region }
          }
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${cityUrl}#breadcrumb`,
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.gearshop.ma/" },
            { "@type": "ListItem", "position": 2, "name": "Livraison au Maroc", "item": "https://www.gearshop.ma/livraison-maroc" },
            { "@type": "ListItem", "position": 3, "name": c.name, "item": cityUrl }
          ]
        }
      ]
    };
    const citySemanticBody = `
    <div id="prerendered-city-seo" style="display:none;" aria-hidden="true">
      <h1>Matériel Photo, Vidéo et Caméras DJI à ${c.name}</h1>
      <p>${cityDesc}</p>
      <p>GearShop fournit des objectifs, filtres, caméras et accessoires avec prix et disponibilité vérifiés dans le catalogue au moment de la commande.</p>
      <h2>Where can I buy professional camera gear in ${c.name}, Morocco?</h2>
      <p>GearShop delivers professional photo and video equipment to ${c.name}. Check the current catalog price and availability before ordering. Estimated delivery: ${c.time}.</p>
    </div>`;

    writeStaticPage(`livraison-maroc/${c.slug}`, cityTitle, cityDesc, cityJsonLd, citySemanticBody);
  }

  // 2. Brand Cluster Pages
  console.log('\n🏷️  Pre-rendering Brand Cluster Pages...');
  const brandList = [
    { slug: '7artisans', title: 'Objectifs 7Artisans Maroc | Distributeur Officiel Casablanca', desc: 'Distributeur officiel 7Artisans au Maroc. Objectifs autofocus F1.8 et ciné T2.0 pour Sony, Canon, Nikon, Lumix, Fuji.' },
    { slug: 'kf-concept', title: 'Filtres K&F Concept Maroc | ND Variable, Black Mist, CPL | GearShop', desc: 'Distributeur officiel K&F Concept au Maroc. Filtres ND variables, Black Diffusion et bagues d\'adaptation à Casablanca.' },
    { slug: 'tamron', title: 'Objectifs Tamron Nikon Z au Maroc | Prix & Disponibilité | GearShop', desc: 'Découvrez les objectifs Tamron pour Nikon Z au Maroc. Prix en MAD et disponibilité à confirmer avant commande chez GearShop.' },
    { slug: 'sony', title: 'Objectifs Sony E-Mount au Maroc | AF F1.8 & Cinéma T2.0 GearShop', desc: 'Objectifs pour boîtiers Sony Alpha et Cinema Line (A7 IV, FX3, FX30) au Maroc. Autofocus et cinéma garantis.' },
    { slug: 'canon', title: 'Objectifs Canon EOS-R (RF-Mount) au Maroc | GearShop Casablanca', desc: 'Objectifs autofocus et série cinéma T2.0 natives pour votre système hybride Canon RF au Maroc.' },
    { slug: 'nikon', title: 'Objectifs Nikon Z au Maroc | Focales Fixes F1.8 & Cinéma GearShop', desc: 'Large choix d\'objectifs pour Nikon Z au Maroc (Z6, Z7, Z8, Z9, Z50) avec stock local à Casablanca.' },
    { slug: 'panasonic', title: 'Objectifs Panasonic Lumix au Maroc (L-Mount & M43) | GearShop', desc: 'Objectifs autofocus et cinéma compatibles Panasonic Lumix S5, S5II, S1H et Micro 4/3 au Maroc.' },
    { slug: 'lumix', title: 'Objectifs Panasonic Lumix au Maroc (L-Mount & M43) | GearShop', desc: 'Achetez vos optiques pour Lumix L-Mount et M43 au Maroc à prix abordable.' },
    { slug: 'fujifilm', title: 'Objectifs Fujifilm au Maroc (X-Mount / FX) | GearShop', desc: 'Objectifs autofocus et cinéma pour capteurs Fuji X-Trans (X-T5, X-T4, X-H2S). Stock à Casablanca.' },
    { slug: 'fuji', title: 'Objectifs Fujifilm au Maroc (X-Mount / FX) | GearShop', desc: 'Gamme complète d\'optiques pour boîtiers hybrides Fujifilm au Maroc.' },
    { slug: 'dji', title: 'Matériel DJI au Maroc | Osmo Pocket & Caméras | GearShop', desc: 'Achetez vos caméras et stabilisateurs DJI au Maroc chez GearShop avec garantie officielle.' },
    { slug: 'godox', title: 'Éclairage Studio & Vidéo Godox au Maroc | GearShop Casablanca', desc: 'Projecteurs LED COB, torches nomades et flashs de studio Godox au Maroc.' },
    { slug: 'rode', title: 'Micros & Audio Røde au Maroc | GearShop Casablanca', desc: 'Systèmes de micros sans fil et micros canon Røde au Maroc pour la production audiovisuelle.' },
  ];

  for (const b of brandList) {
    writeStaticPage(`marque/${b.slug}`, b.title, b.desc);
  }

  // 3. Category Pages
  console.log('\n📂 Pre-rendering Category Pages...');
  const categoryList = [
    { slug: 'objectifs', title: 'Objectifs Photo & Cinéma au Maroc | GearShop Casablanca', desc: 'Achetez vos objectifs photo et lentilles cinéma au Maroc. Autofocus et manuels pour Sony, Canon, Nikon, Lumix.' },
    { slug: 'filtres', title: 'Filtres Photographiques & Vidéo au Maroc | K&F Concept | GearShop', desc: 'Filtres ND variables, filtres CPL polarisants et filtres Black Mist de diffusion au Maroc.' },
    { slug: 'eclairage-studio', title: 'Éclairage Studio Professionnel au Maroc | GearShop Casablanca', desc: 'Projecteurs LED haute puissance et softboxes pour studio photo et plateaux vidéo au Maroc.' },
    { slug: 'eclairage-portable', title: 'Éclairage Portable & Torches LED au Maroc | GearShop', desc: 'Torches LED nomades sur batterie et mini-projecteurs rechargeables pour tournages extérieurs.' },
    { slug: 'accessoires', title: 'Accessoires Photo & Cinéma au Maroc | GearShop Casablanca', desc: 'Bagues d\'adaptation, trépieds, batteries et fixations pour caméras et objectifs.' },
    { slug: 'occasion', title: 'Matériel Photo & Vidéo d\'Occasion Garanti au Maroc | GearShop', desc: 'Matériel d\'occasion certifié et testé par des professionnels avec garantie au Maroc.' },
  ];

  for (const c of categoryList) {
    writeStaticPage(`categorie/${c.slug}`, c.title, c.desc);
  }

  // 4. Use-Case Guide Pages
  console.log('\n🧭 Pre-rendering Use-Case Guide Pages...');
  const guideList = [
    { slug: 'filmmakers', title: 'Guide d\'Équipement pour Cinéastes & Réalisateurs au Maroc | GearShop', desc: 'Sélection d\'objectifs cinéma T2.0, filtres Black Mist et éclairages de tournage au Maroc.' },
    { slug: 'videographers', title: 'Guide d\'Équipement pour Vidéastes & Cadreurs au Maroc | GearShop', desc: 'Setup vidéo professionnel pour événements, corporate et documentaires au Maroc.' },
    { slug: 'content-creators', title: 'Guide Créateurs de Contenu & Vlogs au Maroc | GearShop', desc: 'Matériel recommandé pour YouTube, Instagram et TikTok : caméras nomades, LED et micros.' },
    { slug: 'photographers', title: 'Guide pour Photographes Professionnels au Maroc | GearShop', desc: 'Optiques portrait lumineuses, téléobjectifs et éclairage de studio photo au Maroc.' },
    { slug: 'interviews', title: 'Guide Matériel Tournage Interviews & Podcasts au Maroc | GearShop', desc: 'Setup d\'éclairage 3 points et objectifs recommandés pour la captation d\'interviews.' },
    { slug: 'weddings', title: 'Guide Matériel Photo & Vidéo de Mariage au Maroc | GearShop', desc: 'Objectifs ultra-lumineux et éclairage nomade pour photographes et vidéastes de mariage.' },
  ];

  for (const g of guideList) {
    writeStaticPage(`guide/${g.slug}`, g.title, g.desc);
  }

  // 5. Product Pages from Supabase
  if (supabaseUrl && supabaseKey) {
    console.log('\n📡 Fetching products from Supabase for product pre-rendering...');
    try {
      const products = await fetchProducts(supabaseUrl, supabaseKey);
      console.log(`✅ Fetched ${products.length} products\n`);

      for (const product of products) {
        if (!product.id || !product.name || product.id === 3001) continue;
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
    } catch (err) {
      console.error('❌ Failed to fetch products from Supabase:', err.message);
    }
  }

  console.log(`\n🎉 Pre-rendering complete!`);
  console.log(`   ✅ ${successCount} total pages pre-rendered.`);
  if (errorCount > 0) console.log(`   ❌ ${errorCount} pages failed.`);
}

prerender().catch(err => {
  console.error('Pre-render fatal error:', err);
  process.exit(0);
});
