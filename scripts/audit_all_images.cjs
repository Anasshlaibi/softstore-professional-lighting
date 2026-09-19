const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function audit() {
  const { data: products, error } = await supabase.from('products gearshop').select('*');
  if (error) {
    console.error(error);
    return;
  }

  console.log(`Auditing ${products.length} products...`);
  const missingFiles = [];
  const imageUsages = {};

  for (const p of products) {
    if (!p.image) {
      console.log(`Product [${p.id}] "${p.name}" has NO image!`);
      continue;
    }
    
    // Check local file
    const localRel = p.image.startsWith('/') ? p.image.slice(1) : p.image;
    const localPath = path.join(process.cwd(), 'public', localRel);
    
    if (!fs.existsSync(localPath)) {
      missingFiles.push({ id: p.id, name: p.name, image: p.image });
    } else {
      const stats = fs.statSync(localPath);
      if (stats.size < 500) {
        console.log(`Product [${p.id}] "${p.name}" has tiny/empty image (${stats.size} bytes): ${p.image}`);
      }
    }

    if (!imageUsages[p.image]) imageUsages[p.image] = [];
    imageUsages[p.image].push(p.name);
  }

  console.log(`\nMissing files count: ${missingFiles.length}`);
  if (missingFiles.length > 0) {
    console.log(missingFiles);
  }

  console.log('\n--- Checking for duplicated image usages ---');
  for (const [img, names] of Object.entries(imageUsages)) {
    if (names.length > 3) {
      console.log(`Image ${img} shared by ${names.length} products:`, names.slice(0, 4));
    }
  }
}

audit();
