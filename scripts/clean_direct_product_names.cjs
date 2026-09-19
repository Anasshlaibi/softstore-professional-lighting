const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

function makeDirectBrandModelName(rawName) {
  let name = rawName;

  // Remove prefixes like "Appareil Photo", "APN", "Boîtier Hybride", "Boitier Hybride", "Boîtier", "Boitier"
  name = name.replace(/^([A-Za-z0-9&+\s]+)\s+Appareil\s+Photo\s+/i, '$1 ');
  name = name.replace(/^Appareil\s+Photo\s+/i, '');
  name = name.replace(/^([A-Za-z0-9&+\s]+)\s+Bo[îi]tier\s+Hybride\s+/i, '$1 ');
  name = name.replace(/^([A-Za-z0-9&+\s]+)\s+Bo[îi]tier\s+/i, '$1 ');
  name = name.replace(/^([A-Za-z0-9&+\s]+)\s+Boitier\s+/i, '$1 ');
  name = name.replace(/\bAPN\b/gi, '');

  // Remove "Objectif Sony", "Objectif SEL" redundancies
  name = name.replace(/^Sony\s+Objectif\s+Sony\s+/i, 'Sony ');
  name = name.replace(/^Sony\s+Objectif\s+SEL\s+/i, 'Sony ');
  name = name.replace(/^Nikon\s+Objectif\s+Nikkor\s+/i, 'Nikon Nikkor ');
  name = name.replace(/^Nikon\s+Lens\s+NIKKOR\s+/i, 'Nikon Nikkor ');
  name = name.replace(/^Canon\s+Objectif\s+/i, 'Canon ');

  // Specific cleanups for clean [Brand] [Model] format
  name = name.replace(/^Nikon\s+ZR$/i, 'Nikon ZR');
  name = name.replace(/^Nikon\s+Boîtier.*ZR.*$/i, 'Nikon ZR');
  name = name.replace(/^Nikon\s+Boîtier.*Z6\s+III.*$/i, 'Nikon Z6 III');
  name = name.replace(/^Nikon\s+Boîtier.*Z9.*$/i, 'Nikon Z9');
  name = name.replace(/^Canon\s+Boîtier.*EOS\s+R5\s+Mark\s+II.*$/i, 'Canon EOS R5 Mark II');
  name = name.replace(/^Canon\s+Boîtier.*Cinema\s+EOS\s+C50.*$/i, 'Canon Cinema EOS C50');

  // Remove residual "Ref: XXX"
  name = name.replace(/\s*R[ée]f:?\s*[\w\d\-+/]+/gi, '');
  name = name.replace(/\s*REF:?\s*[\w\d\-+/]+/gi, '');

  // Remove clean "(Boîtier Nu)" if requested to keep strictly brand + model
  name = name.replace(/\s*\(Bo[îi]tier\s+Nu\)/gi, '');

  // Clean double spaces and trim
  name = name.replace(/\s+/g, ' ').trim();

  return name;
}

async function run() {
  console.log('Fetching products to apply direct Brand + Model format...');
  const { data: products, error } = await supabase
    .from('products gearshop')
    .select('id, name')
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  let count = 0;
  for (const p of products) {
    const directName = makeDirectBrandModelName(p.name);
    if (directName !== p.name) {
      const { error: err } = await supabase
        .from('products gearshop')
        .update({ name: directName })
        .eq('id', p.id);

      if (!err) {
        console.log(`[${p.id}] ${p.name}  ===>  ${directName}`);
        count++;
      }
    }
  }

  console.log(`✅ Formatted ${count} product names into direct [Brand] [Model] format!`);
}

run();
