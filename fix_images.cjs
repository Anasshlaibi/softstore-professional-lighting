const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function run() {
  const productsDir = 'C:\\Downloaded Web Sites\\7artisans.store\\products';
  const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.html'));

  const fileData = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(productsDir, file), 'utf8');
    const titleMatch = content.match(/<meta property="og:title" content="([^"]+)">/);
    const imageMatch = content.match(/<meta property="og:image:secure_url" content="([^"]+)">/);
    if (titleMatch && imageMatch) {
      fileData.push({
        title: titleMatch[1].toLowerCase(),
        image: imageMatch[1]
      });
    }
  }

  console.log(`Found ${fileData.length} valid HTML products with images.`);

  const { data: products, error } = await supabase.from('products gearshop').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  let updatedCount = 0;
  for (const product of products) {
    const pName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Find best match in fileData
    let bestMatch = null;
    let maxOverlap = 0;
    
    for (const fd of fileData) {
       const fdName = fd.title.replace(/[^a-z0-9]/g, '');
       if (fdName.includes(pName) || pName.includes(fdName)) {
         bestMatch = fd;
         break; // excellent match
       }
       // Fallback: Check word overlaps
       const pWords = product.name.toLowerCase().split(/[\s-]+/);
       let overlap = 0;
       for (const word of pWords) {
         if (word.length > 1 && fd.title.includes(word)) overlap++;
       }
       if (overlap > maxOverlap && overlap > 2) { // Require at least 3 matching words for a good fallback
         maxOverlap = overlap;
         bestMatch = fd;
       }
    }
    
    if (bestMatch) {
       console.log(`Updating [${product.name}] -> ${bestMatch.image}`);
       await supabase.from('products gearshop').update({ image: bestMatch.image }).eq('id', product.id);
       updatedCount++;
    } else {
       console.log(`NO MATCH for [${product.name}]`);
    }
  }
  console.log(`Updated ${updatedCount} products!`);
}

run();
