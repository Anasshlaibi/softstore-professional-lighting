const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function inspect() {
  const { data, error } = await supabase.from('products gearshop').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log(`Total products: ${data.length}`);

  console.log('\n--- 1. OSMO / POCKET / DJI PRODUCTS ---');
  const dji = data.filter(p => (p.name && (p.name.toLowerCase().includes('pocket') || p.name.toLowerCase().includes('osmo') || p.name.toLowerCase().includes('dji'))));
  dji.forEach(p => console.log(`[ID ${p.id}] ${p.name} -> image: ${p.image}`));

  console.log('\n--- 2. SONY CAMERAS ---');
  const sony = data.filter(p => (p.name && (p.name.toLowerCase().includes('sony') || p.name.toLowerCase().includes('fx3') || p.name.toLowerCase().includes('fx30') || p.name.toLowerCase().includes('a7'))));
  sony.forEach(p => console.log(`[ID ${p.id}] [cat: ${p.category}] ${p.name} -> image: ${p.image}`));

  console.log('\n--- 3. 135MM / 7ARTISANS LENSES ---');
  const l135 = data.filter(p => (p.name && (p.name.toLowerCase().includes('135') || p.name.toLowerCase().includes('7artisans') || p.name.toLowerCase().includes('viltrox'))));
  l135.forEach(p => console.log(`[ID ${p.id}] ${p.name} -> image: ${p.image}`));

  console.log('\n--- 4. LIGHT / YG / Y300 / YB PRODUCTS ---');
  const lights = data.filter(p => (p.name && (p.name.toLowerCase().includes('y300') || p.name.toLowerCase().includes('yb') || p.name.toLowerCase().includes('ym') || p.name.toLowerCase().includes('yg'))));
  lights.forEach(p => console.log(`[ID ${p.id}] ${p.name} -> image: ${p.image}`));
}

inspect();
