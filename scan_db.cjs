const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function run() {
  const { data: products, error } = await supabase.from('products gearshop').select('*');
  
  if (error) {
    console.error("Error fetching:", error);
    return;
  }

  const missingImage = [];
  const missingDesc = [];
  const missingGallery = [];

  for (const p of products) {
    if (!p.image || p.image.trim() === '') missingImage.push(p.name);
    
    // Some descriptions might just be the name, we can check length
    if (!p.desc || p.desc.trim() === '' || p.desc.length < 20) {
      // It's considered missing or very short
      missingDesc.push(p.name);
    }

    let gallery = p.gallery;
    if (typeof gallery === 'string') {
      try { gallery = JSON.parse(gallery); } catch(e) {}
    }
    
    if (!gallery || !Array.isArray(gallery) || gallery.length === 0) {
      missingGallery.push(p.name);
    }
  }

  console.log(`Total Products: ${products.length}`);
  console.log(`Missing Image: ${missingImage.length}`);
  if (missingImage.length > 0 && missingImage.length < 20) console.log(missingImage);
  
  console.log(`Missing Description (< 20 chars): ${missingDesc.length}`);
  if (missingDesc.length > 0 && missingDesc.length < 20) console.log(missingDesc);
  
  console.log(`Missing Gallery: ${missingGallery.length}`);
}

run();
