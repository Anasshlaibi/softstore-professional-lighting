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
  
  const host = req.headers.get('host') || 'gearshop.ma';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/banner_7artisans.jpg</image:loc>
      <image:title>GearShop Maroc - Objectifs 7Artisans et Lentilles Cinéma au Maroc</image:title>
      <image:caption>Seul revendeur officiel d'objectifs 7Artisans au Maroc - Canon, Nikon Z, Sony E</image:caption>
    </image:image>
    <image:image>
      <image:loc>${baseUrl}/cine_lens.jpg</image:loc>
      <image:title>Lentilles Cinéma 7Artisans - Cine Lenses Maroc</image:title>
      <image:caption>Objectifs cinéma 7Artisans T2.0 disponibles au Maroc chez GearShop</image:caption>
    </image:image>
    <image:image>
      <image:loc>${baseUrl}/photo_lens.jpg</image:loc>
      <image:title>Objectifs Photo 7Artisans Maroc</image:title>
      <image:caption>Objectifs photo 7Artisans pour Canon, Nikon Z et Sony E disponibles chez GearShop Maroc</image:caption>
    </image:image>
  </url>`;

  try {
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: products } = await supabase
        .from('products gearshop')
        .select('id, name, image, category, gallery');
      
      if (products) {
        products.forEach((product: any) => {
          const productUrl = `${baseUrl}/product/${product.id}-${slugify(product.name)}`;
          const today = new Date().toISOString().split('T')[0];
          
          xml += `
  <url>
    <loc>${productUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;
          
          // Add primary image to image sitemap (Google Image Search)
          if (product.image) {
            xml += `
    <image:image>
      <image:loc>${product.image}</image:loc>
      <image:title><![CDATA[${product.name} - GearShop Maroc]]></image:title>
      <image:caption><![CDATA[Achetez ${product.name} chez GearShop Maroc - Seul revendeur officiel 7Artisans au Maroc]]></image:caption>
    </image:image>`;
          }
          
          // Add gallery images too (more chances to appear in Google Images)
          if (product.gallery) {
            const gallery = Array.isArray(product.gallery)
              ? product.gallery
              : (() => { try { return JSON.parse(product.gallery); } catch { return []; } })();
            
            gallery.slice(0, 3).forEach((imgUrl: string) => {
              if (imgUrl && imgUrl !== product.image) {
                xml += `
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title><![CDATA[${product.name} - Vue supplémentaire - GearShop Maroc]]></image:title>
    </image:image>`;
              }
            });
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
