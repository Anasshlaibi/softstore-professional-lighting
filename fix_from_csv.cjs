const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function run() {
  const { data: products } = await supabase.from('products gearshop').select('*');
  let updatedCount = 0;

  for (const product of products) {
    if (!product.image || product.image.trim() === '') {
      let newImage = null;

      if (product.gallery) {
        let galleryArr = product.gallery;
        if (typeof galleryArr === 'string') {
          try { galleryArr = JSON.parse(galleryArr); } catch(e) {}
        }
        if (Array.isArray(galleryArr) && galleryArr.length > 0) {
          // Find the first valid URL
          for (const item of galleryArr) {
             const cleaned = String(item).trim();
             if (cleaned.startsWith('http')) {
               newImage = cleaned;
               break;
             }
          }
        }
      }

      if (newImage) {
        console.log(`Updating [${product.name}] image to ${newImage}`);
        await supabase.from('products gearshop').update({ image: newImage }).eq('id', product.id);
        updatedCount++;
      }
    }
  }

  console.log(`Updated ${updatedCount} products from their own gallery column!`);
}

run();
