const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
  }
}

if (!supabaseUrl || !supabaseKey) {
  supabaseUrl = 'https://gunuqwikqhtllwplzcru.supabase.co';
  supabaseKey = 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('products gearshop')
    .select('id, name, image, gallery')
    .ilike('name', '%135mm%');
    
  if (error) console.error(error);
  console.log("135mm Products:", JSON.stringify(data, null, 2));
}

run();
