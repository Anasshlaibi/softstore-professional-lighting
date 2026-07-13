const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function test() {
  console.log('Fetching products_gearshop...');
  const { data, error } = await supabase
    .from('products gearshop')
    .select('*')
    .limit(5);

  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('SUCCESS! Data length:', data.length);
    if (data.length > 0) {
      console.log('Sample item:', data[0].name);
    }
  }
}

test();
