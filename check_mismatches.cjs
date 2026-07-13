const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: products } = await supabase.from('products gearshop').select('id, name, image, gallery');
  
  for (const product of products) {
    console.log(`\nID: ${product.id}`);
    console.log(`Name: ${product.name}`);
    console.log(`Main Image: ${product.image}`);
  }
}

run().catch(console.error);
