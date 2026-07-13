const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function run() {
  const productsDir = 'C:\\Downloaded Web Sites\\7artisans.store\\products';
  
  const mappings = {
    1: { html: 'af-135mm-f1-8-full-frame-lens-for-e-z-l.html' },
    2: { html: '35mm-t2-0-full-frame-cine-lens-for-sony-e-nikon-z-panasonic-l.html' },
    3: { html: '50mm-t2-0-full-frame-cine-lens-for-sony-e-nikon-z-panasonic-l.html' },
    4: { fallback: 'https://7artisans.store/cdn/shop/files/7_d959057b-bd89-4d24-b622-630e5afb8565.jpg?v=1720596151' },
    5: { html: 'af-40mm-f2-5-full-frame-lens-for-e-z-l.html' },
    6: { html: 'af-35mm-f1-8-full-frame-lens-for-e-z-l.html' },
    7: { html: 'af-35mm-f1-8-full-frame-lens-for-e-z-l.html' },
    8: { html: '7artisans-m35mm-f1-4.html' },
    9: { html: 'af-24mm-f1-8-full-frame-lens-for-e.html' },
    10: { html: 'af-25-35-50mm-f1-8-aps-c-lens-for-e-fx-z.html' },
    11: { fallback: 'https://7artisans.store/cdn/shop/products/86.png?v=1672819213' },
    12: { html: 'pl-lens-adapter-kit-pl-e-pl-z-pl-rf-pl-l.html' },
    13: { html: 'variable-nd-filter-67mm-82mm.html' },
    14: { html: 'soft-67mm-82mm.html' }
  };

  let updatedCount = 0;
  
  for (const [id, mapping] of Object.entries(mappings)) {
    let imageUrl = mapping.fallback;
    
    if (mapping.html) {
      try {
        const content = fs.readFileSync(path.join(productsDir, mapping.html), 'utf8');
        const imageMatch = content.match(/<meta property="og:image:secure_url" content="([^"]+)">/);
        if (imageMatch) {
          imageUrl = imageMatch[1];
        }
      } catch (e) {
        console.error(`Could not read ${mapping.html}`);
      }
    }
    
    if (imageUrl) {
      console.log(`Updating ID ${id} to ${imageUrl}`);
      const { error } = await supabase.from('products gearshop').update({ image: imageUrl }).eq('id', Number(id));
      if (!error) updatedCount++;
      else console.error(`Error updating ID ${id}:`, error);
    }
  }
  
  console.log(`Finished updating ${updatedCount} invoice products!`);
}

run();
