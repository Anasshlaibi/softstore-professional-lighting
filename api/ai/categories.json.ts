/**
 * /api/ai/categories.json.ts — Vercel Edge Function
 *
 * Returns a machine-readable category/brand hierarchy derived from
 * the live Supabase product catalog.
 */

import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const CATEGORY_LABELS: Record<string, { fr: string; en: string; ar: string }> = {
  'lenses': { fr: 'Objectifs', en: 'Lenses', ar: 'عدسات' },
  'studio': { fr: 'Éclairage Studio', en: 'Studio Lighting', ar: 'إضاءة استوديو' },
  'portable': { fr: 'Éclairage Portable', en: 'Portable Lighting', ar: 'إضاءة محمولة' },
  'accessories': { fr: 'Accessoires & Filtres', en: 'Accessories & Filters', ar: 'ملحقات وفلاتر' },
  'occasion': { fr: 'Occasion', en: 'Used Equipment', ar: 'معدات مستعملة' },
};

function detectBrand(row: any): string {
  if (row.brand) return row.brand;
  const text = `${row.name || ''} ${row.category || ''}`.toLowerCase();
  if (text.includes('k&f') || text.includes('concept') || text.includes('kf')) return 'K&F Concept';
  if (text.includes('godox')) return 'Godox';
  if (text.includes('sony')) return 'Sony';
  if (text.includes('canon')) return 'Canon';
  if (text.includes('nikon')) return 'Nikon';
  if (text.includes('fuji') || text.includes('fujifilm')) return 'Fujifilm';
  if (text.includes('panasonic') || text.includes('lumix')) return 'Panasonic';
  if (text.includes('dji')) return 'DJI';
  if (text.includes('rode') || text.includes('røde')) return 'Røde';
  return '7Artisans';
}

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
      .select('id, name, category, brand, price, inStock');

    if (error) throw error;

    const catMap = new Map<string, { count: number; brands: Set<string>; minPrice: number; maxPrice: number; inStockCount: number }>();

    (products || []).forEach((row: any) => {
      const cat = (row.category || 'accessories').toLowerCase().trim();
      const brand = detectBrand(row);
      const price = Number(row.price) || 0;
      const inStock = row.inStock !== false;

      if (!catMap.has(cat)) {
        catMap.set(cat, { count: 0, brands: new Set(), minPrice: Infinity, maxPrice: 0, inStockCount: 0 });
      }
      const entry = catMap.get(cat)!;
      entry.count++;
      entry.brands.add(brand);
      if (price > 0 && price < entry.minPrice) entry.minPrice = price;
      if (price > entry.maxPrice) entry.maxPrice = price;
      if (inStock) entry.inStockCount++;
    });

    const categories = Array.from(catMap.entries()).map(([key, data]) => {
      const labels = CATEGORY_LABELS[key] || { fr: key, en: key, ar: key };
      return {
        id: key,
        name: labels,
        slug: key,
        url: `https://gearshop.ma/categorie/${key}`,
        product_count: data.count,
        in_stock_count: data.inStockCount,
        brands: Array.from(data.brands).sort(),
        price_range: {
          min: data.minPrice === Infinity ? 0 : data.minPrice,
          max: data.maxPrice,
          currency: 'MAD',
        },
      };
    }).sort((a, b) => b.product_count - a.product_count);

    const result = {
      store: {
        name: 'GearShop Maroc',
        url: 'https://gearshop.ma',
        location: 'Casablanca, Morocco',
      },
      updated_at: new Date().toISOString(),
      total_categories: categories.length,
      categories,
    };

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to load categories' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
