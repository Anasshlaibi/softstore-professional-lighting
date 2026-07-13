const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

async function fix() {
  const { data } = await supabase.from('products gearshop').select('id, name, gallery');
  
  for (const p of data) {
    if (typeof p.gallery === 'string') {
      try {
        const parsed = JSON.parse(p.gallery);
        if (Array.isArray(parsed)) {
          console.log('Fixing stringified array for', p.name);
          await supabase.from('products gearshop').update({ gallery: parsed }).eq('id', p.id);
        }
      } catch (e) {
        // Not a JSON string
      }
    }
  }
  console.log('Done!');
}
fix();
