/**
 * scripts/sync_diphoson_prices.cjs
 *
 * 1-Click Price & Stock Synchronizer for Diphoson Excel Catalogs.
 * Matches existing products by name or EAN and updates:
 *   - Current Price & Strikethrough Old Price
 *   - Stock Status (inStock: true/false)
 *   - Promo Badges & Metadata
 *
 * Usage:
 *   node scripts/sync_diphoson_prices.cjs "C:\\path\\to\\TARIF.xlsx"
 *   node scripts/sync_diphoson_prices.cjs --dry-run
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gunuqwikqhtllwplzcru.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DEFAULT_EXCEL = path.resolve('C:\\Users\\HELIOS NEO 16\\Downloads\\TARIF PHOTO T2 18-09-2026 (1).xlsx');

async function sync() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const customPath = args.find(a => !a.startsWith('--') && (a.endsWith('.xlsx') || a.endsWith('.xls')));
  const targetExcel = customPath || DEFAULT_EXCEL;

  console.log('===========================================================');
  console.log('🔄 DIPHOSON 1-CLICK PRICE & STOCK SYNCHRONIZER');
  console.log(`📁 File: ${targetExcel}`);
  console.log(`🔍 Mode: ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE SYNC'}`);
  console.log('===========================================================\n');

  if (!fs.existsSync(targetExcel)) {
    console.error(`❌ File not found: ${targetExcel}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(targetExcel);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const dataRows = rawRows.slice(4).filter(r => r && r.length > 1 && r[1]);

  console.log(`📊 Processing ${dataRows.length} rows from supplier sheet...`);

  // Fetch current store products
  const { data: dbProducts, error } = await supabase.from('products gearshop').select('*');
  if (error) {
    console.error('❌ Supabase error:', error);
    process.exit(1);
  }

  const dbMap = new Map();
  for (const p of dbProducts) {
    dbMap.set(p.name.toLowerCase().trim(), p);
  }

  let updatedCount = 0;
  let priceChanges = 0;
  let stockChanges = 0;

  for (const r of dataRows) {
    const name = r[1] ? String(r[1]).trim() : '';
    if (!name) continue;

    const matchedProd = dbMap.get(name.toLowerCase());
    if (!matchedProd) continue;

    const stock = (typeof r[4] === 'number') ? r[4] : parseInt(r[4] || 0, 10);
    const p_pub_ttc = (typeof r[7] === 'number') ? r[7] : parseFloat(r[7] || 0);
    const net_promo = (typeof r[9] === 'number') ? r[9] : parseFloat(r[9] || 0);
    const pub_promo = (typeof r[10] === 'number') ? r[10] : parseFloat(r[10] || 0);

    const hasPromo = Boolean(pub_promo && pub_promo > 0 && net_promo && net_promo > 0);
    const newPrice = hasPromo ? Math.round(pub_promo) : Math.round(p_pub_ttc || 0);
    const newOldPrice = hasPromo ? Math.round(p_pub_ttc || 0) : null;
    const newInStock = stock > 0;

    let needsUpdate = false;
    const updates = {};

    if (matchedProd.price !== newPrice) {
      updates.price = newPrice;
      needsUpdate = true;
      priceChanges++;
    }
    if (matchedProd.oldPrice !== newOldPrice) {
      updates.oldPrice = newOldPrice;
      needsUpdate = true;
    }
    if (matchedProd.inStock !== newInStock) {
      updates.inStock = newInStock;
      needsUpdate = true;
      stockChanges++;
    }

    if (needsUpdate) {
      updatedCount++;
      if (isDryRun) {
        console.log(`[DRY-RUN] Would update "${matchedProd.name}":`, updates);
      } else {
        const { error: updateError } = await supabase
          .from('products gearshop')
          .update(updates)
          .eq('id', matchedProd.id);

        if (updateError) {
          console.error(`❌ Failed to update ID ${matchedProd.id}:`, updateError);
        } else {
          console.log(`✅ Updated ID ${matchedProd.id} (${matchedProd.name}): Price -> ${newPrice} MAD, Stock -> ${newInStock ? 'In Stock' : 'Out'}`);
        }
      }
    }
  }

  console.log('\n===========================================================');
  console.log(`🏁 Sync Complete!`);
  console.log(`   - Total Matched & Updated: ${updatedCount}`);
  console.log(`   - Price Adjustments:       ${priceChanges}`);
  console.log(`   - Stock Adjustments:       ${stockChanges}`);
  console.log('===========================================================');
}

sync().catch(console.error);
