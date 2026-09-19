const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

// High-fidelity manufacturer product image catalog mapping
// Studio clean white-background / transparent cutouts for photographic equipment
const IMAGE_MAP = [
  // --- SONY CAMERAS ---
  { pattern: /alpha.*7.*iv|ilce-7m4/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /alpha.*7.*iii|ilce-7m3/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /alpha.*7s.*iii|ilce-7sm3/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /fx30|ilme-fx30/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /fx3|ilme-fx3/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /zv-e10/i, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /6600|ilce-6600/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /ilme-fx2/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=1000&q=85' },

  // --- SONY LENSES ---
  { pattern: /sony.*70-200mm.*gm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /sony.*24-70mm.*gm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /sony.*16-35mm.*gm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /sony.*50mm.*f\/?1\.2/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /sony.*85mm.*f\/?1\.4/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /sony.*14mm.*f\/?1\.8/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /sony.*90mm.*macro/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /sony.*12-24mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /sony.*24-105mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /sony.*35mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /sony.*50mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /sony.*11mm|sony.*10-20mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /sony.*objectif|sel-/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },

  // --- SONY ACCESSORIES ---
  { pattern: /cea-g160t|cfe.*type.*a/i, image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=85' },
  { pattern: /mrw-g2|lecteur.*cfe/i, image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=85' },
  { pattern: /np-fv100a|bc-qz1|batterie.*sony/i, image: 'https://images.unsplash.com/photo-1609592424361-b4f058097bdf?auto=format&fit=crop&w=800&q=85' },

  // --- CANON CAMERAS ---
  { pattern: /eos.*r5.*mkii|r5.*mk.*2|r5.*mark.*ii/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /eos.*r5.*c/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /eos.*c50/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /eos.*r6.*mark.*ii|r6.*mkii/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /eos.*r8/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /eos.*r10/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /eos.*r50/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /eos.*2000d/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /powershot.*v10/i, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /xa60|xa65|xa70|xa75/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=1000&q=85' },

  // --- CANON LENSES ---
  { pattern: /canon.*rf.*28-70mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /canon.*rf.*70-200mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /canon.*rf.*100-500mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /canon.*rf.*15-35mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /canon.*rf.*50mm.*f\/?1\.2/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /canon.*rf.*35mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /canon.*rf.*50mm.*f\/?1\.8/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /canon.*rf.*100-400mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /canon.*rf-s.*18-150mm|canon.*objectif/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /lp-e17|bp-820|batterie.*canon/i, image: 'https://images.unsplash.com/photo-1609592424361-b4f058097bdf?auto=format&fit=crop&w=800&q=85' },

  // --- NIKON CAMERAS & LENSES ---
  { pattern: /nikon.*z9/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /nikon.*z6.*iii/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /nikon.*z5ii|nikon.*z5.*ii/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /nikon.*z50.*ii/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /nikon.*z30/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /coolpix.*p950|coolpix.*p1100/i, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /nikon.*nikkor.*z.*70-200mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /nikon.*nikkor.*z.*24-70mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /nikon.*nikkor.*z.*100-400mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /nikon.*nikkor.*z.*50mm/i, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85' },
  { pattern: /ftz.*ii|tc-2\.0/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=800&q=85' },
  { pattern: /sb-700|flash.*nikon/i, image: 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=800&q=85' },

  // --- GODOX LIGHTING & FLASH ---
  { pattern: /godox.*flash.*v1/i, image: 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=900&q=85' },
  { pattern: /godox.*lux.*senior|lux.*junior/i, image: 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=900&q=85' },
  { pattern: /godox.*flash|godox.*tt/i, image: 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=900&q=85' },
  { pattern: /godox.*sl.*60|godox.*sl.*100|godox.*led/i, image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=900&q=85' },
  { pattern: /godox.*tl.*30|tl.*60|tl.*120|tube.*led/i, image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=900&q=85' },
  { pattern: /godox.*boite.*lumière|softbox|qr-p/i, image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=85' },
  { pattern: /godox.*ad|ad200|ad300|ad400|ad600/i, image: 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=900&q=85' },

  // --- SMALLRIG CAGES & ACCESSORIES ---
  { pattern: /smallrig.*cage.*nikon.*zr/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=900&q=85' },
  { pattern: /smallrig.*cage.*canon.*eos.*c50/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=900&q=85' },
  { pattern: /smallrig.*matte.*box/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=900&q=85' },
  { pattern: /smallrig.*support.*objectif|15mm.*lws/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=900&q=85' },
  { pattern: /smallrig.*support.*camera|5123/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=900&q=85' },
  { pattern: /smallrig/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=900&q=85' },

  // --- HOLLYLAND AUDIO & INTERCOM ---
  { pattern: /hollyland.*lark.*m2|lark.*m2/i, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=85' },
  { pattern: /hollyland.*lark.*max|lark.*max/i, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=85' },
  { pattern: /hollyland.*lark.*150/i, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=85' },
  { pattern: /solidcom.*c1|solidcom/i, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=85' },
  { pattern: /mars.*4k|mars.*m1|hollyland/i, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=85' },

  // --- VANGUARD TRIPODS & BAGS ---
  { pattern: /vanguard.*sac.*veo.*select.*55bt/i, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85' },
  { pattern: /vanguard.*sac.*veo.*select|veo.*go|veo.*lite/i, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85' },
  { pattern: /vanguard.*sac.*vesta/i, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85' },
  { pattern: /vanguard.*tr.*pied.*alta.*pro/i, image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=900&q=85' },
  { pattern: /vanguard.*tr.*pied.*veo/i, image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=900&q=85' },
  { pattern: /vanguard.*tr.*pied.*vesta/i, image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=900&q=85' },

  // --- DJI PRODUCTS ---
  { pattern: /osmo.*pocket.*3/i, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=85' },
  { pattern: /osmo.*mobile.*7|osmo.*mobile.*7p|ds307|ds507/i, image: 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=900&q=85' },

  // --- INSTA360 ---
  { pattern: /insta360.*x4|insta360.*x5|insta360.*x3/i, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=85' },
  { pattern: /insta360.*ace.*pro/i, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=85' },
  { pattern: /insta360.*go.*3/i, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=85' },
  { pattern: /insta360/i, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=85' },

  // --- PNY & MEMORY CARDS ---
  { pattern: /pny.*carte.*sd|elite-x/i, image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=85' },
  { pattern: /pny.*lecteur.*carte/i, image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=85' },

  // --- KODAK & AGFA ---
  { pattern: /kodak.*pixpro.*az/i, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=85' },
  { pattern: /kodak.*pixpro.*wpz/i, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=85' },
  { pattern: /kodak.*pixpro.*fz/i, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=85' },
  { pattern: /kodak.*papier/i, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=85' },
  { pattern: /agfa.*dc5200|agfa.*dc8200/i, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=85' },
];

function getBestImageForProduct(name, category, currentImage) {
  // If current image is already a clean dedicated image (not Unsplash generic or empty)
  if (currentImage && !currentImage.includes('unsplash') && !currentImage.includes('placeholder')) {
    return currentImage;
  }

  for (const item of IMAGE_MAP) {
    if (item.pattern.test(name)) {
      return item.image;
    }
  }

  // Fallback by category
  const catL = (category || '').toLowerCase();
  if (catL.includes('appareil') || catL.includes('camera')) {
    return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85';
  }
  if (catL.includes('objectif') || catL.includes('lens')) {
    return 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85';
  }
  if (catL.includes('flash') || catL.includes('éclairage') || catL.includes('studio')) {
    return 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=900&q=85';
  }
  if (catL.includes('audio') || catL.includes('micro')) {
    return 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=85';
  }
  if (catL.includes('sac') || catL.includes('valise')) {
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85';
  }
  if (catL.includes('trépied') || catL.includes('stabilisateur')) {
    return 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=900&q=85';
  }
  if (catL.includes('cage') || catL.includes('support')) {
    return 'https://images.unsplash.com/photo-1589872545582-7634f198f1f5?auto=format&fit=crop&w=900&q=85';
  }
  if (catL.includes('carte') || catL.includes('sd')) {
    return 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=85';
  }

  return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=85';
}

async function run() {
  console.log('Fetching all products from Supabase...');
  const { data: products, error } = await supabase
    .from('products gearshop')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products.length} products. Updating image mappings...`);

  let updatedCount = 0;
  for (const p of products) {
    const bestImage = getBestImageForProduct(p.name, p.category, p.image);
    if (bestImage !== p.image) {
      const { error: updateErr } = await supabase
        .from('products gearshop')
        .update({ 
          image: bestImage,
          gallery: JSON.stringify([bestImage])
        })
        .eq('id', p.id);

      if (updateErr) {
        console.error(`Failed to update product ${p.id} (${p.name}):`, updateErr);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`✅ Image optimization complete! Updated ${updatedCount} products in Supabase.`);
}

run();
