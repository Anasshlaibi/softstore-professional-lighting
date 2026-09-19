const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function check() {
  const { data, error } = await supabase.from('products gearshop').select('id, name, image, category');
  if (error) {
    console.error(error);
    return;
  }
  
  const cameras = data.filter(p => p.category === 'Appareil Photo' || p.category === 'cameras' || p.category === 'Caméra');
  console.log('--- ALL CAMERAS IN DATABASE ---');
  for (const c of cameras) {
    console.log(`[ID ${c.id}] [Brand: ${c.brand}] [Cat: ${c.category}] ${c.name} -> ${c.image}`);
  }

  console.log('\n--- 7ARTISANS LENSES ---');
  const lenses = data.filter(p => p.brand === '7Artisans' || (p.name && (p.name.includes('T2.') || p.name.includes('F1.') || p.name.includes('AF') || p.name.includes('mm')) && p.category === 'lenses'));
  for (const l of lenses) {
    console.log(`[ID ${l.id}] ${l.name} -> ${l.image}`);
  }
}

check();
