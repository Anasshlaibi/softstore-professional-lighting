const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function run() {
  // First, nullify the wrong images on IDs 1 to 14
  for (let i = 1; i <= 14; i++) {
    await supabase.from('products gearshop').update({ image: null }).eq('id', i);
  }
  
  // Set the images for the actual invoice products!
  const invoiceImages = {
    1027: 'https://7artisans.store/cdn/shop/files/1_9a398dbc-8564-4118-90c3-d96012864bad.jpg?v=1779179185',
    1002: 'https://7artisans.store/cdn/shop/products/28.png?v=1666604236',
    1004: 'https://7artisans.store/cdn/shop/products/29.png?v=1666604354',
    1035: 'https://7artisans.store/cdn/shop/files/7_d959057b-bd89-4d24-b622-630e5afb8565.jpg?v=1720596151',
    1021: 'https://7artisans.store/cdn/shop/files/1_5f614e8a-15b9-4f9e-a1b7-db9fbf89b1a2.jpg?v=1772003864',
    1019: 'https://7artisans.store/cdn/shop/files/1111_090f390e-b3f4-4eba-ae1a-49a0c210d2d6.jpg?v=1777434863',
    1018: 'https://7artisans.store/cdn/shop/files/1111_090f390e-b3f4-4eba-ae1a-49a0c210d2d6.jpg?v=1777434863',
    1030: 'https://7artisans.store/cdn/shop/files/43_9b4bc88e-cf4d-49d0-aa24-e21573fab61e.png?v=1743235186', // 35mm F1.4 
    1015: 'https://7artisans.store/cdn/shop/files/1_1d2119cf-2c55-46c4-bd6d-6c864abe7fe9.jpg?v=1783909117',
    1023: 'https://7artisans.store/cdn/shop/products/5018.jpg?v=1666173248',
    1043: 'https://7artisans.store/cdn/shop/products/86.png?v=1672819213'
  };

  for (const [id, url] of Object.entries(invoiceImages)) {
    await supabase.from('products gearshop').update({ image: url }).eq('id', Number(id));
  }
  
  console.log("Done fixing images!");
}

run();
