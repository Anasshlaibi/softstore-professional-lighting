/**
 * scripts/sync_04_11_2026_tariff.cjs
 *
 * 1. Inserts the 16 brand-new priced products from TARIF PHOTO T2 04-11-2026 (1).xlsx
 *    with multi-image studio galleries (3-4 images each) and strategic profitable pricing.
 * 2. Updates existing matched products with profitable pricing and accurate stock status:
 *    - Protects margin where 04-11-2026 PA T2 Net TTC increased or where P Public TTC leaves <6% margin.
 *    - Lowers over-priced items (e.g. Canon R5 Mark II ID 6004 from 64,750 DH -> 46,890 DH, Canon R6 Mark II ID 5013 -> 22,190 DH, Instax Mini 12 -> 990 DH) to strategic prices slightly above bare public price to maximize both sales and profit.
 *    - Updates stock status (brings Canon R5 Mark II ID 6004 and Sony A7S III ID 5118 back in stock; marks 5 zero-stock items out of stock).
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gunuqwikqhtllwplzcru.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const EXCEL_PATH = path.resolve('c:/Users/HELIOS NEO 16/Downloads/TARIF PHOTO T2   04 - 11 - 2026 (1).xlsx');

function roundClean(val) {
  if (val < 500) return Math.ceil(val / 10) * 10 - 1; // e.g. 299, 349
  return Math.round(val / 100) * 100 - 10; // e.g. 1490, 21890
}

function generateHtmlDescription({ name, brand, category, price, oldPrice, code, stock }) {
  const brandName = (brand || '').toUpperCase();
  const hasPromo = Boolean(oldPrice && oldPrice > price);
  const discountPercent = hasPromo ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  const promoBanner = discountPercent > 0
    ? `<p><strong>🔥 OFFRE SPÉCIALE : ${price} MAD au lieu de ${oldPrice} MAD (-${discountPercent}% | Économisez ${Math.round(oldPrice - price)} MAD).</strong></p>`
    : `<p><strong>Prix officiel garanti : ${price} MAD | Distributeur Officiel Maroc</strong></p>`;

  const stockLine = stock > 0
    ? `En stock immédiat à Casablanca (${stock} unité${stock > 1 ? 's' : ''} disponible${stock > 1 ? 's' : ''}).`
    : `Disponible sur commande express (Livraison sous 24-48h).`;

  return `<h3>${name} — Matériel Audiovisuel Professionnel au Maroc</h3>
${promoBanner}
<p>Le <strong>${name}</strong> est un équipement de référence sélectionné pour les photographes, vidéastes et professionnels de la production au Maroc. Distribué officiellement avec garantie constructeur 1 an et support technique à Casablanca.</p>

<h3>Caractéristiques & Points Forts</h3>
<ul>
  <li><strong>Marque Officielle :</strong> ${brandName}</li>
  <li><strong>Catégorie Équipement :</strong> ${category}</li>
  <li><strong>Référence / EAN :</strong> ${code || 'Standard Constructeur'}</li>
  <li><strong>Disponibilité :</strong> ${stockLine}</li>
  <li><strong>Fidélité & Performance :</strong> Conçu pour répondre aux exigences rigoureuses des tournages en studio et en extérieur.</li>
</ul>

<h3>Disponibilité & Livraison au Maroc</h3>
<p><strong>Stock immédiat à Casablanca :</strong> Expédition le jour même pour toute commande passée avant 14h (Livraison gratuite dès 2 001 DH d'achat).</p>
<ul>
  <li><strong>Casablanca :</strong> Livraison express 24h ou retrait local au showroom.</li>
  <li><strong>Rabat, Marrakech, Tanger, Fès, Agadir :</strong> Expédition sécurisée 24-48h via transporteur express avec suivi en temps réel.</li>
  <li><strong>Garantie & Paiement :</strong> Paiement à la livraison (Cash on Delivery) & Virement acceptés. Produit neuf scellé avec garantie locale 1 an.</li>
  <li><strong>Facture TVA 20% :</strong> Facture commerciale déductible fournie pour entreprises et boîtes de production.</li>
</ul>

<h3>Questions Fréquentes (FAQ)</h3>
<p><strong>Q : Le produit est-il en stock réel ou sur commande ?</strong><br/>
R : Cet article est en stock physique immédiat à Casablanca pour expédition rapide partout au Maroc.</p>
<p><strong>Q : Quels sont les modes de règlement acceptés ?</strong><br/>
R : Vous pouvez régler en toute sécurité à la livraison (Cash on Delivery) ou par virement bancaire.</p>
<p><strong>Q : Comment s'applique la garantie de 1 an au Maroc ?</strong><br/>
R : Tout notre matériel bénéficie d'une garantie constructeur officielle de 1 an avec SAV local pris en charge à Casablanca.</p>`;
}

const NEW_PRODUCTS_CONFIG = [
  {
    id: 6042,
    name: 'Canon EOS R6 Mark III (Boîtier)',
    brand: 'CANON',
    category: 'Appareil Photo',
    code: '4549292246452',
    stock: 2,
    cost: 31592.95,
    price: 34990,
    oldPrice: null
  },
  {
    id: 6043,
    name: 'Canon EOS R10 + Objectif RF-S 18-45mm f/4.5-6.3 IS STM',
    brand: 'CANON',
    category: 'Appareil Photo',
    code: '4549292189773',
    stock: 1,
    cost: 10353.62,
    price: 11490,
    oldPrice: null
  },
  {
    id: 6044,
    name: 'Canon EOS R100 + Objectif RF-S 18-45mm f/4.5-6.3 IS STM',
    brand: 'CANON',
    category: 'Appareil Photo',
    code: '4549292214598',
    stock: 3,
    cost: 6096.89,
    price: 6690,
    oldPrice: null
  },
  {
    id: 6045,
    name: 'Fujifilm Instax Mini Evo Hybride (Noir)',
    brand: 'FUJIFILM',
    category: 'Appareil Photo',
    code: '4547410520064',
    stock: 60,
    cost: 2060.82,
    price: 2499,
    oldPrice: null
  },
  {
    id: 6046,
    name: 'Insta360 Luna Ultra Standard Bundle (Cosmic Noir)',
    brand: 'Insta360',
    category: 'Caméra',
    code: '6942590201778',
    stock: 17,
    cost: 8385.05,
    price: 9190,
    oldPrice: null
  },
  {
    id: 6047,
    name: 'Insta360 X5 Essentials Kit (Noir)',
    brand: 'Insta360',
    category: 'Caméra',
    code: '6977644761496',
    stock: 34,
    cost: 6916.31,
    price: 7890,
    oldPrice: null
  },
  {
    id: 6048,
    name: 'Insta360 Microphone Sans Fil Mic Pro (2 TX + 1 RX)',
    brand: 'Insta360',
    category: 'Microphone',
    code: '6942590200771',
    stock: 10,
    cost: 2549.61,
    price: 2990,
    oldPrice: null
  },
  {
    id: 6049,
    name: "Insta360 X5 Kit de Remplacement d'Objectif (CINSBAHB)",
    brand: 'Insta360',
    category: 'Accessoires',
    code: '6977644760260',
    stock: 15,
    cost: 336.10,
    price: 429,
    oldPrice: null
  },
  {
    id: 6050,
    name: 'Insta360 Perche à Selfie Invisible 2-en-1 + Trépied (CINX2CB/G)',
    brand: 'Insta360',
    category: 'Trépied',
    code: '6970357852338',
    stock: 17,
    cost: 282.90,
    price: 369,
    oldPrice: null
  },
  {
    id: 6051,
    name: 'Nikon Z6 II (Boîtier)',
    brand: 'NIKON',
    category: 'Appareil Photo',
    code: '4960759912404',
    stock: 2,
    cost: 14664.67,
    price: 15790,
    oldPrice: 16990
  },
  {
    id: 6052,
    name: 'Nikon Chargeur de Batterie MH-25a',
    brand: 'NIKON',
    category: 'Batterie & Chargeur',
    code: '4960759911902',
    stock: 3,
    cost: 565.35,
    price: 679,
    oldPrice: null
  },
  {
    id: 6053,
    name: 'Nikon Nikkor Z 24-200mm f/4-6.3 VR',
    brand: 'NIKON',
    category: 'Objectif',
    code: '18208200924',
    stock: 1,
    cost: 7578.98,
    price: 8290,
    oldPrice: null
  },
  {
    id: 6054,
    name: 'Nikon Nikkor Z MC 105mm f/2.8 VR S Macro',
    brand: 'NIKON',
    category: 'Objectif',
    code: '18208201006',
    stock: 15,
    cost: 9277.24,
    price: 10190,
    oldPrice: 11242
  },
  {
    id: 6055,
    name: 'Nikon Nikkor Z 50mm f/1.4',
    brand: 'NIKON',
    category: 'Objectif',
    code: '18208201280',
    stock: 3,
    cost: 4987.25,
    price: 5490,
    oldPrice: 5699
  },
  {
    id: 6056,
    name: 'Nikon Nikkor Z 85mm f/1.8 S',
    brand: 'NIKON',
    category: 'Objectif',
    code: '4960759902184',
    stock: 5,
    cost: 6789.71,
    price: 7450,
    oldPrice: null
  },
  {
    id: 6057,
    name: 'Sony Alpha 6700 + Objectif E PZ 16-50mm f/3.5-5.6 OSS II',
    brand: 'SONY',
    category: 'Appareil Photo',
    code: '4548736167094',
    stock: 5,
    cost: 17182.13,
    price: 18390,
    oldPrice: null
  }
];

async function run() {
  console.log('=== 1. Loading Gallery Map & Existing Supabase Catalog ===');
  const galleryMap = fs.existsSync('scripts/new_products_16_galleries.json')
    ? JSON.parse(fs.readFileSync('scripts/new_products_16_galleries.json', 'utf8'))
    : {};

  const { data: dbProducts, error: dbErr } = await supabase
    .from('products gearshop')
    .select('*')
    .order('id');

  if (dbErr) {
    console.error('Supabase fetch error:', dbErr);
    process.exit(1);
  }

  // Backup current state before applying 04-11-2026 sync
  fs.writeFileSync(
    'backups/products_gearshop_pre_04_11_2026_sync.json',
    JSON.stringify(dbProducts, null, 2)
  );
  console.log(`Backed up ${dbProducts.length} products to backups/products_gearshop_pre_04_11_2026_sync.json`);

  // === 2. Upsert 16 New Products (ID 6042-6057) ===
  const toUpsertNew = [];
  for (const item of NEW_PRODUCTS_CONFIG) {
    const imgs = galleryMap[item.id] && galleryMap[item.id].length > 0
      ? galleryMap[item.id]
      : ['/images/products/canon-eos-r6-mark-ii.webp'];
    const desc = generateHtmlDescription(item);
    const hasPromo = Boolean(item.oldPrice && item.oldPrice > item.price);
    const specs = [
      `Marque : ${item.brand.toUpperCase()}`,
      `Catégorie : ${item.category}`,
      `Référence / EAN : ${item.code}`,
      `Stock Disponible : ${item.stock} unité${item.stock > 1 ? 's' : ''}`,
      hasPromo ? `Promotion Spéciale : -${Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}%` : 'Meilleur Prix Maroc Garanti',
      'Paiement à la livraison & Virement acceptés',
      'Garantie Locale 1 An & SAV Casablanca'
    ];

    toUpsertNew.push({
      id: item.id,
      name: item.name,
      price: item.price,
      oldPrice: item.oldPrice,
      rentPrice: 0,
      category: item.category,
      image: imgs[0],
      gallery: imgs,
      video: '',
      desc: desc,
      stars: 5,
      specs: specs,
      inStock: item.stock > 0,
      promoEligible: hasPromo ? 'True' : 'False'
    });
  }

  const { data: insertedNew, error: insertErr } = await supabase
    .from('products gearshop')
    .upsert(toUpsertNew, { onConflict: 'id' })
    .select('id, name, price');

  if (insertErr) {
    console.error('Error upserting 16 new products:', insertErr);
    process.exit(1);
  }
  console.log(`✅ Upserted ${insertedNew.length} new products (IDs 6042-6057)!`);

  // === 3. Apply Strategic Price & Stock Updates on Existing Matched Products ===
  const wb = xlsx.readFile(EXCEL_PATH);
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }).slice(4).filter(r => r && r[1]);

  const byEan = new Map();
  for (const p of dbProducts) {
    const specsStr = JSON.stringify(p.specs || '') + ' ' + (p.desc || '');
    const m = specsStr.match(/(\d{11,14})/);
    if (m) byEan.set(m[1], p);
  }

  let updatedCount = 0;
  const updateSummary = [];

  for (const r of rows) {
    const ean = String(r[0] || '').trim();
    const stock = Number(r[4] || 0);
    const normalNet = Number(r[6] || 0);
    const normalPub = Number(r[7] || 0);
    const promoNet = Number(r[9] || 0);
    const promoPub = Number(r[10] || 0);

    let p = byEan.get(ean);
    if (!p && ean === '4549292229158') p = dbProducts.find(x => x.id === 6004);
    if (!p) continue;

    const effCost = promoNet > 0 ? promoNet : normalNet;
    const effPub = promoPub > 0 ? promoPub : normalPub;
    if (effCost <= 0) continue;

    let minMarkup = 1.06;
    if (effCost < 500) minMarkup = 1.18;
    else if (effCost < 1500) minMarkup = 1.12;
    else if (effCost < 5000) minMarkup = 1.09;
    else if (effCost < 15000) minMarkup = 1.075;
    else if (effCost < 30000) minMarkup = 1.06;
    else minMarkup = 1.055;

    const minTargetPrice = roundClean(effCost * minMarkup);
    let newPrice = p.price;
    let newOldPrice = p.oldPrice;

    if (p.id === 6004) {
      newPrice = 46890;
      newOldPrice = 49990;
    } else if (p.id === 5013) {
      newPrice = 22190;
      newOldPrice = 23490;
    } else if ([5015, 5016, 5017, 5018].includes(p.id)) {
      newPrice = 990;
      newOldPrice = 1099;
    } else if (p.price < minTargetPrice) {
      newPrice = Math.max(minTargetPrice, effPub > 0 ? roundClean(effPub * 1.03) : minTargetPrice);
      if (normalPub > newPrice) {
        newOldPrice = Math.round(normalPub);
      }
    }

    // Ensure oldPrice is strictly greater than newPrice
    if (newOldPrice && newOldPrice <= newPrice) {
      newOldPrice = normalPub > newPrice ? Math.round(normalPub) : null;
    }

    const newInStock = stock > 0;

    if (newPrice !== p.price || newOldPrice !== p.oldPrice || newInStock !== p.inStock || p.id === 6004) {
      // Update description price references cleanly
      let updatedDesc = p.desc || '';
      if (p.price && newPrice !== p.price) {
        updatedDesc = updatedDesc.replace(new RegExp(`\\b${p.price}\\s*MAD`, 'g'), `${newPrice} MAD`);
      }
      if (p.id === 6004) {
        updatedDesc = updatedDesc.replace(/4549292229172/g, '4549292229158');
      }

      let updatedSpecs = Array.isArray(p.specs) ? [...p.specs] : [];
      if (p.id === 6004) {
        updatedSpecs = updatedSpecs.map(s => String(s).replace(/4549292229172/g, '4549292229158'));
      }
      updatedSpecs = updatedSpecs.map(s => {
        if (String(s).startsWith('Stock Disponible') || String(s).startsWith('Sur Commande')) {
          return stock > 0 ? `Stock Disponible : ${stock} unités` : 'Sur Commande Express';
        }
        return s;
      });

      const { error: uErr } = await supabase
        .from('products gearshop')
        .update({
          price: newPrice,
          oldPrice: newOldPrice,
          inStock: newInStock,
          desc: updatedDesc,
          specs: updatedSpecs
        })
        .eq('id', p.id);

      if (uErr) {
        console.error(`Error updating ID ${p.id}:`, uErr);
      } else {
        updatedCount++;
        updateSummary.push({
          id: p.id,
          name: p.name,
          oldPrice: p.price,
          newPrice,
          effCost: Math.round(effCost),
          effPub: Math.round(effPub),
          profitDH: Math.round(newPrice - effCost),
          marginPct: ((newPrice - effCost) / newPrice * 100).toFixed(1) + '%',
          oldInStock: p.inStock,
          newInStock
        });
      }
    }
  }

  fs.writeFileSync('scripts/tariff_04_11_2026_applied_summary.json', JSON.stringify({
    insertedNew: NEW_PRODUCTS_CONFIG,
    updatedExisting: updateSummary
  }, null, 2));

  console.log(`✅ Updated ${updatedCount} existing products in Supabase!`);
}

run().catch(console.error);

