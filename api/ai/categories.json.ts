/**
 * /api/ai/categories.json.ts — Vercel Edge Function
 *
 * Machine-readable category taxonomy and product counts for GearShop Maroc.
 */

export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://gunuqwikqhtllwplzcru.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';

export default async function handler(req: Request) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/products%20gearshop?select=*&order=id.asc`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Supabase error ${res.status}`);
    }

    const products = await res.json();
    const baseUrl = 'https://gearshop.ma';

    // Group products by category
    const categoryMap = new Map<string, any[]>();
    (products || []).forEach((p: any) => {
      const cat = (p.category || 'accessories').toLowerCase().trim();
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push(p);
    });

    const categoryTaxonomy: Record<string, { fr: string; en: string; ar: string; desc: string }> = {
      'lenses': {
        fr: 'Objectifs Photo & Cinéma',
        en: 'Photo & Cinema Lenses',
        ar: 'عدسات تصوير وسينما',
        desc: 'Objectifs autofocus et manuels plein format, ciné T2.0 pour Sony E, Canon RF, Nikon Z, Lumix L, Fuji X.'
      },
      'objectifs': {
        fr: 'Objectifs Photo & Cinéma',
        en: 'Photo & Cinema Lenses',
        ar: 'عدسات تصوير وسينما',
        desc: 'Objectifs autofocus et manuels plein format, ciné T2.0 pour Sony E, Canon RF, Nikon Z, Lumix L, Fuji X.'
      },
      'filtres': {
        fr: 'Filtres Photographiques & Vidéo',
        en: 'Camera Filters',
        ar: 'فلاتر الكاميرا',
        desc: 'Filtres ND variables, filtres CPL polarisants, filtres Black Mist de diffusion et bagues step-up K&F Concept.'
      },
      'eclairage-studio': {
        fr: 'Éclairage Studio & Vidéo',
        en: 'Studio Lighting',
        ar: 'إضاءة استوديو',
        desc: 'Projecteurs LED COB, softboxes paraboliques, panneaux bicolores et équipement lumière plateau.'
      },
      'eclairage-portable': {
        fr: 'Éclairage Portable & Nomade',
        en: 'Portable Lighting',
        ar: 'إضاءة محمولة',
        desc: 'Torches vidéo LED compactes, mini-panneaux RGB et barres LED nomades sur batterie.'
      },
      'accessoires': {
        fr: 'Accessoires Photo & Cinéma',
        en: 'Camera Accessories',
        ar: 'ملحقات التصوير',
        desc: 'Bagues d\'adaptation de monture, trépieds, sacs photo étanches et kits d\'entretien optique.'
      },
      'occasion': {
        fr: 'Matériel d\'Occasion Garanti',
        en: 'Used & Certified Equipment',
        ar: 'معدات مستعملة مضمونة',
        desc: 'Boîtiers, objectifs et matériel vidéo testés par nos experts avec garantie locale.'
      }
    };

    const categories = Array.from(categoryMap.entries()).map(([slug, items]) => {
      const info = categoryTaxonomy[slug] || {
        fr: slug.charAt(0).toUpperCase() + slug.slice(1),
        en: slug.charAt(0).toUpperCase() + slug.slice(1),
        ar: slug,
        desc: `Produits de la catégorie ${slug} chez GearShop Maroc.`
      };

      const prices = items.map(p => Number(p.price) || 0).filter(p => p > 0);
      const inStock = items.filter(p => p.inStock !== false && p.instock !== false).length;

      return {
        slug,
        name: {
          fr: info.fr,
          en: info.en,
          ar: info.ar,
        },
        description: info.desc,
        url: `${baseUrl}/categorie/${slug}`,
        product_count: items.length,
        in_stock_count: inStock,
        price_range_mad: {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0,
        },
        sample_products: items.slice(0, 3).map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.price) || 0,
        })),
      };
    });

    return new Response(JSON.stringify({
      '@context': 'https://schema.org',
      store: 'GearShop Maroc',
      updated_at: new Date().toISOString(),
      total_categories: categories.length,
      categories,
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Failed to load categories', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}
