const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gunuqwikqhtllwplzcru.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BASE_URL = 'https://gearshop.ma';

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

async function generateMerchantFeed() {
  try {
    console.log('Fetching products from Supabase for Google Merchant Center...');
    const { data: products, error } = await supabase
      .from('products gearshop')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    console.log(`Fetched ${products.length} products.`);

    let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>GearShop Maroc</title>
    <link>${BASE_URL}</link>
    <description>Matériel Photo &amp; Vidéo Professionnel au Maroc</description>
`;

    products.forEach(product => {
      if (!product.id || !product.name || !product.price) return;

      const slug = slugify(product.name);
      const productUrl = `${BASE_URL}/product/${product.id}-${slug}`;
      const escapedTitle = escapeXml(product.name);
      
      // Clean up description (strip HTML tags for plain text or leave simple formatting)
      let desc = product.desc || product.name;
      desc = desc.replace(/<[^>]*>?/gm, ''); // Strip HTML tags
      const escapedDesc = escapeXml(desc).substring(0, 5000); // Google limit is 5000

      let imageUrl = product.image || '';
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      else if (imageUrl.startsWith('/cdn/')) imageUrl = 'https://7artisans.store' + imageUrl;
      else if (imageUrl.startsWith('/')) imageUrl = BASE_URL + imageUrl;

      // Price formatting (Google requires currency, e.g., '1500.00 MAD')
      // Assuming product.price is a number
      const priceFormatted = Number(product.price).toFixed(2) + ' MAD';

      xml += `    <item>
      <g:id>${product.id}</g:id>
      <g:title>${escapedTitle}</g:title>
      <g:description>${escapedDesc}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${priceFormatted}</g:price>
      <g:brand>7Artisans</g:brand>
    </item>\n`;
    });

    xml += `  </channel>\n</rss>`;

    const outputPath = path.join(__dirname, '..', 'public', 'google-merchant-feed.xml');
    fs.writeFileSync(outputPath, xml);
    console.log(`Successfully wrote Google Merchant feed to ${outputPath}`);
  } catch (err) {
    console.error('Error generating Merchant feed:', err);
    process.exit(1);
  }
}

generateMerchantFeed();
