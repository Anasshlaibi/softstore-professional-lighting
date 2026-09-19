const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function checkCatalog() {
  const { data: products, error } = await supabase.from('products gearshop').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  console.log('Total products in database:', products.length);
  
  let withKamerty = 0;
  let withUnsplash = 0;
  let withLocal = 0;
  let withSaymon = 0;
  let withoutImage = 0;

  const sampleMissing = [];

  products.forEach(p => {
    if (!p.image) {
      withoutImage++;
      sampleMissing.push({ id: p.id, name: p.name, brand: p.brand });
    } else if (p.image.includes('kamerty.ma')) {
      withKamerty++;
    } else if (p.image.includes('saymonshop.com') || p.image.startsWith('/images/')) {
      withSaymon++;
    } else if (p.image.includes('unsplash.com')) {
      withUnsplash++;
      sampleMissing.push({ id: p.id, name: p.name, brand: p.brand });
    } else {
      withLocal++;
    }
  });

  console.log('Images breakdown:');
  console.log('- Kamerty CDN URLs (need downloading locally with SEO names):', withKamerty);
  console.log('- Unsplash placeholders (need real product matching):', withUnsplash);
  console.log('- Local / Saymon paths:', withSaymon);
  console.log('- Other URLs:', withLocal);
  console.log('- Missing image:', withoutImage);

  console.log('\nSample items with Unsplash or missing:');
  console.log(sampleMissing.slice(0, 20));
}

checkCatalog();
