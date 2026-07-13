const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

const manualMappings = {
  '35mm T2.0': 'https://7artisans.store/cdn/shop/products/28.png?v=1666604236',
  '50mm T2.0': 'https://7artisans.store/cdn/shop/products/29.png?v=1666604354',
  '50mm F1.2': 'https://7artisans.store/cdn/shop/files/7_d959057b-bd89-4d24-b622-630e5afb8565.jpg?v=1720596151',
  'AF50mm F1.8': 'https://7artisans.store/cdn/shop/files/1_6f02ec7f-86ee-475c-8fe0-8689032d41cc.jpg?v=1770622210',
  'AF24mm F1.8': 'https://7artisans.store/cdn/shop/files/1_1d2119cf-2c55-46c4-bd6d-6c864abe7fe9.jpg?v=1783909117',
  'AF35mm F1.8': 'https://7artisans.store/cdn/shop/files/1111_090f390e-b3f4-4eba-ae1a-49a0c210d2d6.jpg?v=1777434863',
  'AF40mm F2.5': 'https://7artisans.store/cdn/shop/files/1_5f614e8a-15b9-4f9e-a1b7-db9fbf89b1a2.jpg?v=1772003864',
  'AF135mm F1.8': 'https://7artisans.store/cdn/shop/files/1_9a398dbc-8564-4118-90c3-d96012864bad.jpg?v=1779179185',
  '35mm F1.4': 'https://7artisans.store/cdn/shop/products/3514m.jpg?v=1666250981',
  '35mm/F1.4': 'https://7artisans.store/cdn/shop/products/3514m.jpg?v=1666250981',
  '10mm T2.1': 'https://7artisans.store/cdn/shop/files/7_d959057b-bd89-4d24-b622-630e5afb8565.jpg?v=1720596151',
  '16mm T2.1': 'https://7artisans.store/cdn/shop/files/7_d959057b-bd89-4d24-b622-630e5afb8565.jpg?v=1720596151',
  'Panel P-500': 'https://7artisans.store/cdn/shop/products/86.png?v=1672819213',
  'P-60S Spotlight': 'https://7artisans.store/cdn/shop/products/86.png?v=1672819213',
  'BKL400Bi Bi-Color': 'https://7artisans.store/cdn/shop/products/86.png?v=1672819213'
};

function getBaseName(name) {
  // Extract the main lens name like "35mm T2.0" from "35mm T2.0 Sony (E Mount) - Black"
  for (const key of Object.keys(manualMappings)) {
    if (name.includes(key)) return key;
  }
  return name.split(' Sony')[0].split(' Fuji')[0].split(' Nikon')[0].split(' Canon')[0].split(' Panasonic')[0].trim();
}

async function run() {
  const { data: products } = await supabase.from('products gearshop').select('*');
  
  let updatedCount = 0;
  
  for (const product of products) {
    if (!product.image || product.image.trim() === '') {
      const baseName = getBaseName(product.name);
      
      let newImage = null;
      
      // 1. Try to find another product with the same base name that HAS an image
      const sibling = products.find(p => p.id !== product.id && p.image && getBaseName(p.name) === baseName);
      if (sibling) {
        newImage = sibling.image;
      } 
      // 2. Fallback to manual mapping
      else if (manualMappings[baseName]) {
        newImage = manualMappings[baseName];
      }
      
      if (newImage) {
        console.log(`Fixing [${product.name}] -> ${newImage}`);
        await supabase.from('products gearshop').update({ image: newImage }).eq('id', product.id);
        updatedCount++;
      } else {
        console.log(`Could not find an image for [${product.name}] (Base: ${baseName})`);
      }
    }
  }
  console.log(`Fixed ${updatedCount} products!`);
}

run();
