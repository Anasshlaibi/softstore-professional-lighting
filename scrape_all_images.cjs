const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

// Since we have Vite, we can parse .env.local manually
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
  // Fallback to known values from fix_galleries.cjs
  supabaseUrl = 'https://gunuqwikqhtllwplzcru.supabase.co';
  supabaseKey = 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: dbProducts } = await supabase.from('products gearshop').select('id, name, image, gallery');
  console.log('Sample DB products:', dbProducts.slice(0, 5).map(p => p.name));
  
  const htmlDir = 'C:/Downloaded Web Sites/7artisans.store/products';
  
  if (!fs.existsSync(htmlDir)) {
    console.log('HTML dir not found!');
    return;
  }
  
  const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
  
  let updated = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(htmlDir, file), 'utf8');
    const $ = cheerio.load(content);
    
    // Shopify stores actual product name in h1.product__title or og:title
    let title = $('meta[property="og:title"]').attr('content') || $('title').text().trim().replace(' – 7artisans', '').trim();
    
    // Find matching product in DB by checking if one string contains the other
    let match = dbProducts.find(p => p.name.toLowerCase().trim() === title.toLowerCase().trim() || p.name.includes(title) || title.includes(p.name));
    
    if (!match) {
      // Try to match focal length and aperture
      const focalMatch = title.match(/(\d+(?:\.\d+)?)mm/i);
      const apertureMatch = title.match(/[fT]\/?(\d+(?:\.\d+)?)/i);
      if (focalMatch) {
        const f = focalMatch[1];
        const a = apertureMatch ? apertureMatch[1] : null;
        
        match = dbProducts.find(p => {
          const pf = p.name.match(/(\d+(?:\.\d+)?)mm/i);
          const pa = p.name.match(/[fT]\/?(\d+(?:\.\d+)?)/i);
          if (pf && pf[1] === f) {
            if (a && pa && pa[1] === a) return true;
            if (!a) return true;
          }
          return false;
        });
      }
    }
    
    if (!match) {
      continue;
    }

    const images = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && src.includes('cdn/shop/files') && !src.includes('logo')) {
        let clean = src.split('?')[0].replace('../', 'https://7artisans.store/');
        if (clean.startsWith('//')) clean = 'https:' + clean;
        // remove duplicate thumbnails that have widths like _416x.jpg
        clean = clean.replace(/_\d+x\d+(@2x)?/, '');
        clean = clean.replace(/_\d+x/, '');
        
        if (!images.includes(clean)) images.push(clean);
      }
    });

    if (images.length > 0) {
      console.log('Updating images for', match.name, 'with', images.length, 'images.');
      await supabase.from('products gearshop').update({
        image: images[0],
        gallery: images
      }).eq('id', match.id);
      updated++;
    }
  }
  console.log('Done! Updated', updated, 'products.');
}

run();
