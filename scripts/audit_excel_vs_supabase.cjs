const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

function makeDirectCleanName(rawName, brand) {
  let name = rawName.trim();
  // Remove APN, Boitier, Réf, etc.
  name = name.replace(/^([A-Za-z0-9&+\s]+)\s+Appareil\s+Photo\s+Num[ée]rique\s+/i, '$1 ');
  name = name.replace(/^([A-Za-z0-9&+\s]+)\s+Appareil\s+Photo\s+/i, '$1 ');
  name = name.replace(/^Appareil\s+Photo\s+/i, '');
  name = name.replace(/^([A-Za-z0-9&+\s]+)\s+Bo[îi]tier\s+Hybride\s+/i, '$1 ');
  name = name.replace(/^([A-Za-z0-9&+\s]+)\s+Bo[îi]tier\s+/i, '$1 ');
  name = name.replace(/^([A-Za-z0-9&+\s]+)\s+Boitier\s+/i, '$1 ');
  name = name.replace(/\bAPN\b/gi, '').replace(/\bRef:\s*[A-Za-z0-9-]+\b/gi, '').replace(/\bRéf:\s*[A-Za-z0-9-]+\b/gi, '');
  name = name.replace(/\s{2,}/g, ' ').trim();

  // If brand is Nikon and designation starts with Nikon, ensure clean format
  if (rawName.includes('Boitier ZR')) {
    return 'Nikon ZR';
  }
  if (rawName.includes('Boitier Z6 III')) {
    return 'Nikon Z6 III';
  }
  if (rawName.includes('Boitier Z9')) {
    return 'Nikon Z9';
  }
  if (rawName.includes('Z5II')) {
    if (rawName.includes('24-50mm')) return 'Nikon Z5 II Kit 24-50mm';
    return 'Nikon Z5 II';
  }
  if (rawName.includes('Z50 II')) {
    return 'Nikon Z50 II Kit 16-50mm';
  }
  if (rawName.includes('Z30')) {
    return 'Nikon Z30 Kit 16-50mm';
  }
  if (rawName.includes('Coolpix') && rawName.includes('P950')) {
    return 'Nikon Coolpix P950';
  }
  if (rawName.includes('Coolpix') && rawName.includes('P1100')) {
    return 'Nikon Coolpix P1100';
  }

  return name;
}

async function runAudit() {
  const wb = xlsx.readFile('C:\\Users\\HELIOS NEO 16\\Downloads\\TARIF PHOTO T2 18-09-2026 (1).xlsx');
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
  const { data: dbProducts } = await supabase.from('products gearshop').select('*');

  console.log(`Excel rows: ${rows.length}, Supabase products: ${dbProducts.length}`);

  const updates = [];

  // Specifically fix Nikon ZR and check all other products
  for (const p of dbProducts) {
    if (p.name.includes('Z fc / ZR') || p.name.includes('Boitier ZR') || p.id === 5099) {
      updates.push({
        id: p.id,
        name: 'Nikon ZR',
        category: 'camera',
        image: '/images/products/nikon-zr.webp',
        gallery: ['/images/products/nikon-zr.webp']
      });
    } else if (p.name.includes('Z6 III')) {
      updates.push({
        id: p.id,
        name: 'Nikon Z6 III',
        category: 'camera',
        image: '/images/products/nikon-z6-iii.webp',
        gallery: ['/images/products/nikon-z6-iii.webp']
      });
    } else if (p.name.includes('Z9')) {
      updates.push({
        id: p.id,
        name: 'Nikon Z9',
        category: 'camera',
        image: '/images/products/nikon-z9.webp',
        gallery: ['/images/products/nikon-z9.webp']
      });
    } else if (p.name.includes('Coolpix MégapixelsNoir') || p.name.includes('P950')) {
      updates.push({
        id: p.id,
        name: 'Nikon Coolpix P950',
        category: 'camera',
        image: '/images/products/nikon-coolpix-p950.webp',
        gallery: ['/images/products/nikon-coolpix-p950.webp']
      });
    }
  }

  for (const u of updates) {
    console.log(`Updating product ${u.id} -> ${u.name}`);
    await supabase.from('products gearshop').update({
      name: u.name,
      category: u.category || undefined,
      image: u.image,
      gallery: u.gallery
    }).eq('id', u.id);
  }

  console.log(`Updated ${updates.length} products to exact clean direct naming.`);
}

runAudit().catch(console.error);
