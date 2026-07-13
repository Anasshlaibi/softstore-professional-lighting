const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

function fixUrl(url) {
  if (!url) return url;
  let newUrl = url;
  if (newUrl.startsWith('../cdn/')) {
    newUrl = newUrl.replace('../cdn/', 'https://7artisans.store/cdn/');
  }
  // Remove HTML entity encoding for ampersands which breaks URLs
  newUrl = newUrl.replace(/&amp;/g, '&');
  return newUrl;
}

async function run() {
  const { data: products, error } = await supabase.from('products gearshop').select('*');
  if (error) {
    console.error("Error fetching:", error);
    return;
  }

  let updatedCount = 0;

  for (const p of products) {
    let changed = false;
    let updatePayload = {};

    if (p.image && p.image.includes('../cdn/')) {
      updatePayload.image = fixUrl(p.image);
      changed = true;
    }

    let gallery = p.gallery;
    if (typeof gallery === 'string') {
      try { gallery = JSON.parse(gallery); } catch(e) {}
    }
    
    if (gallery && Array.isArray(gallery)) {
      let galleryChanged = false;
      const newGallery = gallery.map(url => {
        const fixed = fixUrl(url);
        if (fixed !== url) galleryChanged = true;
        return fixed;
      });

      if (galleryChanged) {
        updatePayload.gallery = newGallery;
        changed = true;
      }
    }

    if (changed) {
      console.log(`Fixing URLs for [${p.name}]`);
      await supabase.from('products gearshop').update(updatePayload).eq('id', p.id);
      updatedCount++;
    }
  }

  console.log(`\nSuccessfully fixed URLs for ${updatedCount} products.`);
}

run();
