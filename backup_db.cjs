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
  console.log('Fetching all products from Supabase for backup...');
  const { data: products, error } = await supabase.from('products gearshop').select('id, name, image, gallery');
  
  if (error) {
    console.error('Failed to fetch products:', error);
    process.exit(1);
  }

  fs.writeFileSync('db_image_backup.json', JSON.stringify(products, null, 2));
  console.log(`Successfully backed up ${products.length} products to db_image_backup.json`);
}

run().catch(console.error);
