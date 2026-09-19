const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

function cleanProductTitle(rawName) {
  let name = rawName;

  // 1. Remove raw APN / Appareil Photo Numerique repetitions
  name = name.replace(/\bAPN\b/gi, '');
  name = name.replace(/Appareil\s+Photo\s+Num[ée]rique/gi, 'Appareil Photo');
  name = name.replace(/Appareil\s+Photo\s+Numerique/gi, 'Appareil Photo');

  // 2. Clean Sony SEL / FE naming
  name = name.replace(/\bObjectif\s+SEL\s+/gi, 'Objectif Sony ');
  name = name.replace(/\bObjectif\s+SEL-/gi, 'Objectif Sony ');

  // 3. Remove raw supplier "REF: XXX" or "Réf: XXX" at the end of the public title
  name = name.replace(/\s*R[ée]f:?\s*[\w\d\-+/]+\s*(\+\s*Objectif.*)?/gi, (match, p1) => {
    return p1 ? ` ${p1}` : '';
  });
  name = name.replace(/\s*REF:?\s*[\w\d\-+/]+\s*(\+\s*Objectif.*)?/gi, (match, p1) => {
    return p1 ? ` ${p1}` : '';
  });

  // 4. Normalize Whitespace & Brand Duplications
  name = name.replace(/\s+/g, ' ').trim();
  name = name.replace(/^(Sony|Canon|Nikon|Godox|Fujifilm|Kodak|Agfa|Vanguard|Hollyland|Insta360|PNY|SmallRig)\s+\1/i, '$1');

  // 5. Clean common patterns
  name = name.replace(/^Nikon\s+Boitier\s+ZR$/i, 'Nikon Boîtier Hybride Z fc / ZR (Noir)');
  name = name.replace(/Boitier\s+Z6\s+III/i, 'Boîtier Hybride Z6 III');
  name = name.replace(/Boitier\s+Z9/i, 'Boîtier Hybride Z9');
  name = name.replace(/Boitier\s+EOS\s+C50/i, 'Boîtier Hybride Cinema EOS C50');
  name = name.replace(/Boitier\s+EOS\s+R5\s+MKII/i, 'Boîtier EOS R5 Mark II');
  name = name.replace(/Alpha\s+7\s+MARK\s+IV/i, 'Alpha 7 IV');
  name = name.replace(/Alpha\s+7\s+MARK\s+III/i, 'Alpha 7 III');
  name = name.replace(/Alpha\s+7S\s+MARK\s+III/i, 'Alpha 7S III');
  name = name.replace(/FX30/i, 'Cinema Line FX30');
  name = name.replace(/FX3A/i, 'Cinema Line FX3');

  // Clean trailing '+' or '-'
  name = name.replace(/\s*\+\s*$/, '').trim();

  return name;
}

async function run() {
  console.log('Fetching products to clean titles...');
  const { data: products, error } = await supabase
    .from('products gearshop')
    .select('id, name')
    .gte('id', 5000)
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  let count = 0;
  for (const p of products) {
    const cleaned = cleanProductTitle(p.name);
    if (cleaned !== p.name) {
      const { error: updateErr } = await supabase
        .from('products gearshop')
        .update({ name: cleaned })
        .eq('id', p.id);

      if (!updateErr) {
        console.log(`[${p.id}] ${p.name}  --->  ${cleaned}`);
        count++;
      }
    }
  }

  console.log(`✅ Cleaned ${count} titles in Supabase!`);
}

run();
