/*
 * Read-only catalog readiness audit.
 *
 * This creates a prioritised CSV for the product-content workflow. It never
 * changes Supabase or product files. Run: npm run audit:catalog
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://gunuqwikqhtllwplzcru.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

const siteUrl = 'https://www.gearshop.ma';
const outputDir = path.join(process.cwd(), 'reports');

function text(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function mediaList(product) {
  const gallery = Array.isArray(product.gallery)
    ? product.gallery
    : typeof product.gallery === 'string'
      ? (() => { try { return JSON.parse(product.gallery); } catch { return []; } })()
      : [];
  return [...new Set([product.image, ...gallery].filter(Boolean))];
}

function localImageState(image) {
  if (!image) return 'missing';
  if (/^https?:\/\//i.test(image)) return 'remote';
  const filePath = path.join(process.cwd(), 'public', image.replace(/^\//, ''));
  return fs.existsSync(filePath) && fs.statSync(filePath).size > 1024 ? 'local-valid' : 'local-missing';
}

function csv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function auditProduct(product) {
  const name = text(product.name);
  const description = text(product.desc);
  const specs = text(product.specs);
  const images = mediaList(product);
  const imageState = localImageState(product.image);
  const issues = [];
  let score = 100;

  if (images.length < 4) { issues.push(`only-${images.length}-image${images.length === 1 ? '' : 's'}`); score -= 35; }
  if (imageState === 'missing' || imageState === 'local-missing') { issues.push('missing-primary-image'); score -= 30; }
  if (name.length < 25) { issues.push('short-product-name'); score -= 10; }
  if (description.length < 160) { issues.push('thin-description'); score -= 15; }
  if (specs.length < 80) { issues.push('missing-or-thin-specifications'); score -= 10; }
  if (!product.price || Number(product.price) <= 0) { issues.push('missing-price'); score -= 20; }
  if (product.inStock === null || product.inStock === undefined) { issues.push('missing-availability'); score -= 10; }

  return {
    id: product.id,
    product_url: `${siteUrl}/product/${product.id}-${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
    name,
    price_mad: product.price || '',
    availability: product.inStock ? 'InStock' : 'OutOfStock',
    image_count: images.length,
    primary_image_state: imageState,
    description_characters: description.length,
    specifications_characters: specs.length,
    readiness_score: Math.max(0, score),
    priority: score < 50 ? 'P0' : score < 70 ? 'P1' : score < 85 ? 'P2' : 'P3',
    issues: issues.join('; '),
  };
}

async function main() {
  const { data: products, error } = await supabase.from('products gearshop').select('*').order('id');
  if (error) throw error;
  const rows = products.map(auditProduct).sort((a, b) => a.readiness_score - b.readiness_score || a.id - b.id);
  fs.mkdirSync(outputDir, { recursive: true });
  const headers = Object.keys(rows[0] || {});
  const csvContent = [headers.join(','), ...rows.map(row => headers.map(key => csv(row[key])).join(','))].join('\n');
  fs.writeFileSync(path.join(outputDir, 'catalog-readiness-audit.csv'), csvContent);
  fs.writeFileSync(path.join(outputDir, 'catalog-readiness-summary.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    productCount: rows.length,
    imageGoal: 'At least 4 verified, exact-variant product images per product',
    priorityCounts: Object.fromEntries(['P0', 'P1', 'P2', 'P3'].map(priority => [priority, rows.filter(row => row.priority === priority).length])),
    imageCounts: {
      fewerThanFour: rows.filter(row => row.image_count < 4).length,
      noPrimaryImage: rows.filter(row => row.primary_image_state === 'missing' || row.primary_image_state === 'local-missing').length,
    },
  }, null, 2));
  console.log(`Audited ${rows.length} products.`);
  console.log(`P0: ${rows.filter(row => row.priority === 'P0').length}; P1: ${rows.filter(row => row.priority === 'P1').length}; P2: ${rows.filter(row => row.priority === 'P2').length}; P3: ${rows.filter(row => row.priority === 'P3').length}`);
  console.log(`Reports: ${path.relative(process.cwd(), outputDir)}`);
}

main().catch(error => { console.error(error.message); process.exit(1); });
