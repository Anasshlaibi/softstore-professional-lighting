/**
 * /api/ai/product.ts — Vercel Edge Function
 *
 * Returns rich machine-readable JSON for a single product.
 * Called via:
 *   /ai/product/[slug].json -> rewritten to /api/ai/product?slug=[slug]
 *   /api/ai/product?id=[id]
 *   /api/ai/product?slug=[slug]
 */

import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

function slugify(text: string): string {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function detectBrand(row: any): string {
  if (row.brand) return row.brand;
  const text = `${row.name || ''} ${row.category || ''} ${row.desc || ''}`.toLowerCase();
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
  if (row.mount) return row.mount;
  const text = `${row.name || ''} ${row.desc || ''}`.toLowerCase();
  if (text.includes('sony e') || text.includes('e mount') || text.includes('e-mount')) return 'Sony E';
  if (text.includes('canon rf') || text.includes('eos-r') || text.includes('rf mount')) return 'Canon RF';
  if (text.includes('nikon z') || text.includes('z mount') || text.includes('z-mount')) return 'Nikon Z';
  if (text.includes('fuji') || text.includes('fx mount') || text.includes('x mount') || text.includes('x-mount')) return 'Fujifilm X';
  if (text.includes('l mount') || text.includes('l-mount')) return 'L-Mount';
  if (text.includes('m43') || text.includes('micro 4/3')) return 'Micro 4/3';
  return null;
}

function parseSpecs(row: any): Record<string, string> {
  const specs: Record<string, string> = {};
  const rawSpecs = Array.isArray(row.specs) ? row.specs : [];
  rawSpecs.forEach((s: string) => {
    if (s.includes(':') || s.includes('：')) {
      const parts = s.split(/[:：]/);
      if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
        specs[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    }
  });
  return specs;
}

export default async function handler(req: Request) {
  const urlObj = new URL(req.url);
  let slug = urlObj.searchParams.get('slug') || '';
  const idParam = urlObj.searchParams.get('id');

  // Strip .json if present in slug parameter
  slug = slug.replace(/\.json$/i, '');

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Database unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: allProducts, error } = await supabase
      .from('products gearshop')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    let targetProduct: any = null;

    if (idParam) {
      const parsedId = parseInt(idParam, 10);
      targetProduct = (allProducts || []).find((p: any) => p.id === parsedId);
    } else if (slug) {
      // Try ID prefix match (e.g. 1000-35mm-t2-0-sony-e-mount-black)
      const idPrefixMatch = slug.match(/^(\d+)-/);
      if (idPrefixMatch) {
        const id = parseInt(idPrefixMatch[1], 10);
        targetProduct = (allProducts || []).find((p: any) => p.id === id);
      }

      // If not matched, try matching exact slugified name
      if (!targetProduct) {
        targetProduct = (allProducts || []).find((p: any) => slugify(p.name) === slug);
      }

      // If still not matched, try partial substring match
      if (!targetProduct) {
        targetProduct = (allProducts || []).find((p: any) => slugify(p.name).includes(slug) || slug.includes(slugify(p.name)));
      }
    }

    if (!targetProduct) {
      return new Response(JSON.stringify({ error: 'Product not found', requested_slug: slug }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const baseUrl = 'https://gearshop.ma';
    const brand = detectBrand(targetProduct);
    const mount = detectMount(targetProduct);
    const prodSlug = slugify(targetProduct.name);
    const canonicalUrl = `${baseUrl}/product/${targetProduct.id}-${prodSlug}`;
    const isPreorder = targetProduct.isPreorder === true || targetProduct.ispreorder === true;
    const inStock = targetProduct.inStock !== false && targetProduct.instock !== false;

    // Parse gallery
    let gallery: string[] = [];
    if (targetProduct.gallery) {
      if (Array.isArray(targetProduct.gallery)) gallery = targetProduct.gallery;
      else { try { gallery = JSON.parse(targetProduct.gallery); } catch (e) {} }
    }

    // Related products in same category or same mount
    const related = (allProducts || [])
      .filter((p: any) => p.id !== targetProduct.id && (p.category === targetProduct.category || (mount && detectMount(p) === mount)))
      .slice(0, 4)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        url: `${baseUrl}/product/${p.id}-${slugify(p.name)}`
      }));

    // Alternatives: same category, different brand or model
    const alternatives = (allProducts || [])
      .filter((p: any) => p.id !== targetProduct.id && p.category === targetProduct.category)
      .slice(0, 4)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        brand: detectBrand(p),
        price: Number(p.price) || 0,
        url: `${baseUrl}/product/${p.id}-${slugify(p.name)}`
      }));

    // Compatible Accessories (filters, adapters, accessories)
    const accessories = (allProducts || [])
      .filter((p: any) => {
        if (p.id === targetProduct.id) return false;
        const cat = (p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return cat.includes('access') || cat.includes('filter') || cat.includes('filtre') || name.includes('filter') || name.includes('bague');
      })
      .slice(0, 4)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        url: `${baseUrl}/product/${p.id}-${slugify(p.name)}`
      }));

    // Determine use cases based on product specifications
    const useCases: string[] = [];
    const text = `${targetProduct.name} ${targetProduct.desc} ${targetProduct.category}`.toLowerCase();
    if (text.includes('cinema') || text.includes('t2.0') || text.includes('t2.1') || text.includes('cine')) {
      useCases.push('Cinematography', 'Film Production', 'Commercials');
    }
    if (text.includes('50mm') || text.includes('85mm') || text.includes('135mm') || text.includes('portrait')) {
      useCases.push('Portrait Photography', 'Weddings', 'Fashion');
    }
    if (text.includes('10mm') || text.includes('24mm') || text.includes('35mm') || text.includes('vlog')) {
      useCases.push('Landscape', 'Architecture', 'Vlogging & Content Creation');
    }
    if (text.includes('light') || text.includes('led') || text.includes('studio') || text.includes('eclairage')) {
      useCases.push('Studio Lighting', 'Interviews', 'Video Content');
    }
    if (useCases.length === 0) {
      useCases.push('General Photography & Videography');
    }

    const payload = {
      id: targetProduct.id,
      sku: `GS-${targetProduct.id}`,
      name: targetProduct.name,
      brand,
      category: targetProduct.category || 'accessories',
      subcategory: targetProduct.product_type || null,
      description: targetProduct.meta_description || targetProduct.desc || '',
      canonical_url: canonicalUrl,
      image: targetProduct.image || null,
      gallery: gallery.slice(0, 6),
      price: Number(targetProduct.price) || 0,
      old_price: targetProduct.oldPrice ? Number(targetProduct.oldPrice) : null,
      currency: 'MAD',
      availability: isPreorder ? 'PreOrder' : inStock ? 'InStock' : 'OutOfStock',
      condition: (targetProduct.category || '').toLowerCase().includes('occasion') ? 'used' : 'new',
      specifications: parseSpecs(targetProduct),
      compatibility: {
        mount: mount || 'Universal / Standard',
        supported_systems: mount ? [mount] : ['Universal'],
      },
      use_cases: useCases,
      alternatives,
      related_products: related,
      accessories,
      store: {
        name: 'GearShop Maroc',
        url: baseUrl,
        warranty: '1 year official warranty',
        shipping: 'Express delivery in Morocco (24h Casablanca, 2-4 days national)',
        contact_whatsapp: 'https://wa.me/212673011873'
      },
      updated_at: new Date().toISOString()
    };

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve product', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
