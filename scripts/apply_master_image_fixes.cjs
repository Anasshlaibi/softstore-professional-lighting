const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function applyFixes() {
  console.log("=== PHASE 3: APPLYING PRODUCT & IMAGE INTEGRITY FIXES ===");

  // Specific mapping fixes for P0 / P1 products
  const updates = [
    {
      id: 1062, // 55mm 1/8 Black Mist Filter - Black
      image: "https://cdn.shopify.com/s/files/1/0555/8504/6736/files/08-06_VND.jpg?v=1722932210", // Actual filter image (non-lens)
      gallery: [
        "https://cdn.shopify.com/s/files/1/0555/8504/6736/files/08-06_VND.jpg?v=1722932210"
      ],
      desc: "Filtre 7Artisans 55mm Black Mist 1/8 pour un rendu cinématique doux et une réduction des hautes lumières."
    },
    {
      id: 1060, // PL 4-in-1 Lens Adapter compatible with E / L / RF / Z Mount - Silver
      image: "https://cdn.shopify.com/s/files/1/0555/8504/6736/files/1_a309bf99-2e99-4d89-a5bc-28f48cded8a4.jpg?v=1772606130", // Authentic PL adapter photo
      gallery: [
        "https://cdn.shopify.com/s/files/1/0555/8504/6736/files/1_a309bf99-2e99-4d89-a5bc-28f48cded8a4.jpg?v=1772606130",
        "https://cdn.shopify.com/s/files/1/0555/8504/6736/files/4_e7469826-b36b-4c2a-806a-8dfaed45f673.jpg?v=1772606286",
        "https://cdn.shopify.com/s/files/1/0555/8504/6736/files/2_e47044e0-bb8c-4afd-a941-83dc05efee82.jpg?v=1772606479"
      ]
    },
    {
      id: 1043, // Autofocus adapter for Canon EF - Nikon Z - Black
      image: "https://cdn.shopify.com/s/files/1/0555/8504/6736/products/6_6e23eacf-6b37-499a-8b5f-b53efaaed46f.jpg?v=1659681589", // Actual EF-Z AF Adapter photo
      gallery: [
        "https://cdn.shopify.com/s/files/1/0555/8504/6736/products/6_6e23eacf-6b37-499a-8b5f-b53efaaed46f.jpg?v=1659681589",
        "https://cdn.shopify.com/s/files/1/0555/8504/6736/products/3_dc9e895f-5a8a-4a9e-ba2e-fb30e31ee3d8.jpg?v=1659681589"
      ]
    },
    {
      id: 1061, // 77mm True Color VND6-9 Filter - Black
      image: "https://cdn.shopify.com/s/files/1/0555/8504/6736/files/08-06_VND.jpg?v=1722932210",
      gallery: [
        "https://cdn.shopify.com/s/files/1/0555/8504/6736/files/08-06_VND.jpg?v=1722932210"
      ]
    },
    // 16mm T2.1 Titanium Gray variants (IDs 1056, 1057, 1058, 1059) -> set Titanium Gray product photo
    {
      id: 1056, // 16mm T2.1 Sony (E Mount) - Titanium Gray
      image: "https://cdn.shopify.com/s/files/1/0555/8504/6736/files/7_d959057b-bd89-4d24-b622-630e5afb8565.jpg?v=1720596151" // Titanium gray finish tag
    },
    {
      id: 1057, // 16mm T2.1 Fuji (FX Mount) - Titanium Gray
      image: "https://cdn.shopify.com/s/files/1/0555/8504/6736/files/7_d959057b-bd89-4d24-b622-630e5afb8565.jpg?v=1720596151"
    },
    {
      id: 1058, // 16mm T2.1 M43 (Panasonic Olympus) - Titanium Gray
      image: "https://cdn.shopify.com/s/files/1/0555/8504/6736/files/7_d959057b-bd89-4d24-b622-630e5afb8565.jpg?v=1720596151"
    },
    {
      id: 1059, // 16mm T2.1 Canon (EOS-R Mount) - Titanium Gray
      image: "https://cdn.shopify.com/s/files/1/0555/8504/6736/files/7_d959057b-bd89-4d24-b622-630e5afb8565.jpg?v=1720596151"
    }
  ];

  for (const u of updates) {
    const patch = {};
    if (u.image) patch.image = u.image;
    if (u.gallery) patch.gallery = u.gallery;
    if (u.desc) patch.desc = u.desc;

    const { error } = await supabase.from('products gearshop').update(patch).eq('id', u.id);
    if (error) {
      console.error(`Failed to update product ID ${u.id}:`, error);
    } else {
      console.log(`Successfully updated product ID ${u.id}`);
    }
  }

  console.log("\n=== VERIFYING DATABASE STATE AFTER UPDATES ===");
  const { data: verifyProducts } = await supabase.from('products gearshop').select('id, name, image').in('id', [1062, 1060, 1043, 1061]);
  verifyProducts.forEach(p => {
    console.log(`ID ${p.id} | ${p.name} -> Image: ${p.image}`);
  });
}

applyFixes().catch(console.error);
