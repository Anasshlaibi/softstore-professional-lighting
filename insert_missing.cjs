const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function run() {
  const { data: allProducts } = await supabase.from('products gearshop').select('id').order('id', { ascending: false }).limit(1);
  let nextId = (allProducts && allProducts.length > 0) ? allProducts[0].id + 1 : 1060;

  const newProducts = [
    {
      id: nextId++,
      name: 'PL 4-in-1 Lens Adapter compatible with E / L / RF / Z Mount - Silver',
      price: 150,
      oldPrice: 200,
      category: 'Accessories',
      inStock: true,
      desc: 'PL 4-in-1 Lens Adapter compatible with E/L/RF/Z mount',
      stars: 5,
      image: 'https://7artisans.store/cdn/shop/files/7_d959057b-bd89-4d24-b622-630e5afb8565.jpg?v=1720596151'
    },
    {
      id: nextId++,
      name: '77mm True Color VND6-9 Filter - Black',
      price: 80,
      oldPrice: 100,
      category: 'Accessories',
      inStock: true,
      desc: '77mm True Color VND6-9 Filter',
      stars: 5,
      image: 'https://7artisans.store/cdn/shop/files/43_9b4bc88e-cf4d-49d0-aa24-e21573fab61e.png?v=1743235186'
    },
    {
      id: nextId++,
      name: '55mm 1/8 Black Mist Filter - Black',
      price: 45,
      oldPrice: 60,
      category: 'Accessories',
      inStock: true,
      desc: '55mm 1/8 Black Mist Filter',
      stars: 5,
      image: 'https://7artisans.store/cdn/shop/files/43_9b4bc88e-cf4d-49d0-aa24-e21573fab61e.png?v=1743235186'
    }
  ];

  for (const prod of newProducts) {
    const { data, error } = await supabase
      .from('products gearshop')
      .insert([prod])
      .select();
      
    if (error) {
      console.error("Error inserting:", prod.name, error);
    } else {
      console.log("Inserted:", data[0].name, "with ID:", data[0].id);
    }
  }
}

run();
