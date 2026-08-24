/**
 * /api/ai/brands.json.ts — Vercel Edge Function
 *
 * Returns a machine-readable brand index with product counts, 
 * categories, mount systems — all derived from live catalog.
 */

import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

function slugify(text: string): string {
  return (text || '').toLowerCase().replace(/[&]/g, '-and-').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function detectBrand(row: any): string {
  if (row.brand) return row.brand;
  const text = `${row.name || ''} ${row.category || ''}`.toLowerCase();
  if (text.includes('k&f') || text.includes('concept') || text.includes('kf')) return 'K&F Concept';
  if (text.includes('7artisans')) return '7Artisans';
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

function detectMount(row: any): string | null {
  const text = `${row.name || ''} ${row.desc || ''}`.toLowerCase();
  if (text.includes('sony e') || text.includes('e mount') || text.includes('e-mount')) return 'Sony E';
  if (text.includes('canon rf') || text.includes('eos-r') || text.includes('rf mount')) return 'Canon RF';
  if (text.includes('nikon z') || text.includes('z mount') || text.includes('z-mount')) return 'Nikon Z';
  if (text.includes('fuji') || text.includes('fx mount') || text.includes('x mount')) return 'Fujifilm X';
  if (text.includes('l mount') || text.includes('l-mount')) return 'L-Mount';
  if (text.includes('m43') || text.includes('micro 4/3')) return 'Micro 4/3';
  return null;
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
      .select('id, name, category, brand, desc, price, inStock');

    if (error) throw error;

    const brandMap = new Map<string, {
      categories: Set<string>;
      mounts: Set<string>;
      count: number;
      inStockCount: number;
      minPrice: number;
      maxPrice: number;
    }>();

    (products || []).forEach((row: any) => {
      const brand = detectBrand(row);
      const mount = detectMount(row);
      const cat = (row.category || 'accessories').toLowerCase().trim();
      const price = Number(row.price) || 0;
      const inStock = row.inStock !== false;

      if (!brandMap.has(brand)) {
        brandMap.set(brand, {
          categories: new Set(),
          mounts: new Set(),
          count: 0,
          inStockCount: 0,
          minPrice: Infinity,
          maxPrice: 0,
        });
      }
      const entry = brandMap.get(brand)!;
      entry.count++;
      entry.categories.add(cat);
      if (mount) entry.mounts.add(mount);
      if (price > 0 && price < entry.minPrice) entry.minPrice = price;
      if (price > entry.maxPrice) entry.maxPrice = price;
      if (inStock) entry.inStockCount++;
    });

    const brands = Array.from(brandMap.entries()).map(([name, data]) => ({
      name,
      slug: slugify(name),
      url: `https://gearshop.ma/marque/${slugify(name)}`,
      product_count: data.count,
      in_stock_count: data.inStockCount,
      categories: Array.from(data.categories).sort(),
      mount_systems: Array.from(data.mounts).sort(),
      price_range: {
        min: data.minPrice === Infinity ? 0 : data.minPrice,
        max: data.maxPrice,
        currency: 'MAD',
      },
    })).sort((a, b) => b.product_count - a.product_count);

    const result = {
      store: {
        name: 'GearShop Maroc',
        url: 'https://gearshop.ma',
        location: 'Casablanca, Morocco',
      },
      updated_at: new Date().toISOString(),
      total_brands: brands.length,
      brands,
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
    return new Response(JSON.stringify({ error: 'Failed to load brands' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
