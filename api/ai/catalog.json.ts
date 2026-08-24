/**
 * /api/ai/catalog.json.ts — Vercel Edge Function
 *
 * Unified machine-readable overview of the GearShop catalog,
 * store policies, available brands, categories, and AI discovery endpoints.
 */

import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Catalog unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: products, error } = await supabase
      .from('products gearshop')
      .select('id, name, category, brand, price, inStock')
      .order('id', { ascending: true });

    if (error) throw error;

    const baseUrl = 'https://gearshop.ma';
    const now = new Date().toISOString();

    const brandSet = new Set<string>();
    const categorySet = new Set<string>();
    let inStockCount = 0;
    const prices: number[] = [];

    (products || []).forEach((p: any) => {
      if (p.brand) brandSet.add(p.brand);
      if (p.category) categorySet.add(p.category.toLowerCase().trim());
      if (p.inStock !== false && p.instock !== false) inStockCount++;
      const price = Number(p.price) || 0;
      if (price > 0) prices.push(price);
    });

    const catalogOverview = {
      '@context': 'https://schema.org',
      store: {
        name: 'GearShop Maroc',
        alternate_names: ['Soft Store Maroc', 'GearShop Casablanca'],
        url: baseUrl,
        description: 'Distributeur officiel et détaillant agréé au Maroc pour objectifs 7Artisans, filtres K&F Concept, matériel DJI et éclairage studio.',
        location: {
          city: 'Casablanca',
          country: 'Morocco',
          region: 'Casablanca-Settat',
          physical_store: true,
          address: 'Casablanca, Morocco'
        },
        contact: {
          phone: '+212673011873',
          email: 'contact@gearshop.ma',
          whatsapp: 'https://wa.me/212673011873',
          hours: 'Monday to Saturday, 09:00 - 20:00 (GMT+1)'
        },
        policies: {
          currency: 'MAD (Dirham Marocain)',
          warranty: '1 year manufacturer warranty with local Casablanca service',
          shipping: {
            casablanca: '24-48h express',
            national: '2-4 business days across Morocco',
            free_threshold_mad: 500
          },
          payment_methods: ['Cash on Delivery (Paiement à la livraison)', 'Bank Transfer (Virement)', 'Credit Card (Carte Bancaire)']
        }
      },
      stats: {
        total_products: (products || []).length,
        in_stock_products: inStockCount,
        brands_count: brandSet.size,
        categories_count: categorySet.size,
        price_range_mad: {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0
        }
      },
      endpoints: {
        catalog_overview: `${baseUrl}/ai/catalog.json`,
        all_products: `${baseUrl}/ai/products.json`,
        categories_index: `${baseUrl}/ai/categories.json`,
        brands_index: `${baseUrl}/ai/brands.json`,
        single_product_template: `${baseUrl}/ai/product/{slug}.json`,
        llms_text: `${baseUrl}/llms.txt`,
        sitemap_xml: `${baseUrl}/sitemap.xml`
      },
      updated_at: now
    };

    return new Response(JSON.stringify(catalogOverview, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to load catalog overview' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
