import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const slugify = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export default async function handler(req: Request) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  
  const host = req.headers.get('host') || 'softstore.ma';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  try {
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: products } = await supabase.from('products gearshop').select('id, name, image');
      
      if (products) {
        products.forEach((product: any) => {
          const productUrl = `${baseUrl}/product/${product.id}-${slugify(product.name)}`;
          xml += `
  <url>
    <loc>${productUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;
          
          if (product.image) {
            xml += `
    <image:image>
      <image:loc>${product.image}</image:loc>
      <image:title><![CDATA[${product.name}]]></image:title>
    </image:image>`;
          }
          
          xml += `
  </url>`;
        });
      }
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
