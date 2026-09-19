import { supabase } from '../lib/supabase';
import { Product } from '../../App';
import { defaultProducts } from '../../data/products';

export async function fetchSupabaseProducts(): Promise<Product[]> {
  try {
    const fetchPromise = supabase
      .from('products gearshop')
      .select('*')
      .order('id', { ascending: true });

    // 5-second timeout to prevent infinite loading spinner
    const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timed out after 5 seconds')), 5000)
    );

    const raceResult = await Promise.race([fetchPromise, timeoutPromise]);
    const data = (raceResult as { data: Record<string, unknown>[] | null }).data;
    const error = (raceResult as { error: Error | null }).error;

    if (error) {
      console.error('Supabase error fetching products:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Helper to parse strings that might be JSON arrays or comma separated
    const parseArraySafe = (val: unknown): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map(String);
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed.map(String) : [val];
        } catch {
          return val.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      return [];
    };

    // Map Supabase rows to our Product interface
    const mappedProducts = data.map((row: Record<string, unknown>, index: number): Product => {
      const gallery = parseArraySafe(row.gallery);
      const specs = parseArraySafe(row.specs);

      const id = Number(row.id) || (index + 1000); // fallback ID if missing
      const name = String(row.name || '');
      let price = Number(row.price) || 0;
      if (id === 3001 || name.toLowerCase().includes('pocket 4 pro')) {
        price = 8000;
      }

      return {
        id: id,
        name: name,
        price: price,
        oldPrice: row.oldprice || row.oldPrice ? Number(row.oldprice || row.oldPrice) : undefined,
        rentPrice: row.rentprice || row.rentPrice ? Number(row.rentprice || row.rentPrice) : undefined,
        category: String(row.category || 'accessories'),
        image: String(row.image || ''),
        gallery: gallery,
        video: String(row.video || ''),
        desc: String(row.desc || ''),
        stars: Number(row.stars) || 5,
        specs: specs,
        inStock: row.inStock !== false && row.instock !== false && row.instock !== 'FALSE' && row.instock !== 'false',
        isPreorder: row.isPreorder === true || row.ispreorder === true || row.status === 'Précommande' || String(row.name || '').toLowerCase().includes('précommande'),
        promoEligible: row.promoEligible === true || row.promoeligible === true || row.promoeligible === 'TRUE' || row.promoeligible === 'true',
        // Enriched fields from Supabase DB columns
        brand: row.brand ? String(row.brand) : undefined,
        mount: row.mount ? String(row.mount) : undefined,
        product_group: row.product_group ? String(row.product_group) : undefined,
        seo_title: row.seo_title ? String(row.seo_title) : undefined,
        meta_description: row.meta_description ? String(row.meta_description) : undefined,
        seo_intro: row.seo_intro ? String(row.seo_intro) : undefined,
        seo_description: row.seo_description ? String(row.seo_description) : undefined,
        custom_faq: parseArraySafe(row.custom_faq).map(item => {
          try {
            return typeof item === 'object' ? item : JSON.parse(item);
          } catch {
            return { question: '', answer: item };
          }
        }),
        search_aliases: parseArraySafe(row.search_aliases),
      };
    });

    // Merge local products (such as Occasion/Ninja V) that may not be in remote DB
    const existingIds = new Set(mappedProducts.map(p => p.id));
    for (const defProd of defaultProducts) {
      if (!existingIds.has(defProd.id)) {
        mappedProducts.push(defProd);
        existingIds.add(defProd.id);
      }
    }

    // Curated rich audiovisual mix: DJI Osmo Pocket, Cameras, 7Artisans 135mm, Cinema Lenses, Photo Lenses, Bags, Filters & Lights
    const featuredNames = [
      'DJI Osmo Pocket 4 Pro',
      'Sony Alpha 7 IV Kit + Objectif 28-70mm',
      'AF135mm F1.8 Sony (E Mount) - Black',
      'Sony Cinema Line FX30',
      'Vanguard Sac à Dos Photo VEO GO 42M Noir',
      '77mm True Color VND6-9 Filter - Black',
      'DJI Osmo Pocket 3 Creator Combo',
      '35mm T2.0 Nikon (Z Mount) - Black',
      'Sony FE 50mm f/1.8',
      'K&F Concept 82mm 3-in-1 ND2-32 & CPL & Black Mist 1/4 Filter (Nano-Xcel)',
      'Canon EOS R50 + Objectif RF-S 18-45mm IS STM',
      'Vanguard Sac Photo VEO SELECT 22S Noir',
      'AF135mm F1.8 Nikon (Z Mount) - Black',
      'YM 350',
      '55mm 1/8 Black Mist Filter - Black',
      'K&F Concept Sac Bandoulière Photo Étanche pour Caméra & Accessoires',
      'Canon RF 50MM F1.8 STM',
      'Insta360 Flow 2 Standard Bundle / Summit White CINSABQA',
      '50mm T2.0 Sony (E Mount) - Black',
      'Vanguard Sac à Dos Photo Trolley VEO SELECT 55BT Noir',
      'YB-300R',
      'Nikon Z30 Kit + Objectif Nikkor Z DX 16-50mm f/3.5-6.3 VR',
      'Nikon Nikkor Z 50mm f/1.8 S',
      'Sony FE 24-70mm F2.8 GM II',
      'AF40mm F2.5 Sony (E Mount) - Black',
      'Autofocus adapter for Canon EF - Nikon Z - Black',
      '50mm F1.2 Nikon (Z Mount) - Black',
      'Canon RF 35mm f/1.8 Macro IS STM',
      'Sony FE 85mm F/1.4 GM',
      'AF35mm F1.8 Sony (E Mount) - Black',
      'AF35mm F1.8 Nikon (Z Mount) - Black',
      'AF50mm F1.8 Sony (E Mount) - Black',
      'AF50mm F1.8 Nikon (Z Mount) - Black',
      'AF24mm F1.8 Sony (E Mount) - Black',
      'Sony FE 24-105mm F4 G OSS',
      'Canon RF 100-400mm F5.6-8 IS USM',
      'PL 4-in-1 Lens Adapter compatible with E / L / RF / Z Mount - Silver'
    ];

    mappedProducts.sort((a, b) => {
      const aIndex = featuredNames.indexOf(a.name);
      const bIndex = featuredNames.indexOf(b.name);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex; // Both featured, sort by array order
      if (aIndex !== -1) return -1; // A is featured, B is not
      if (bIndex !== -1) return 1; // B is featured, A is not
      return 0; // Neither is featured, keep original ID order
    });

    return mappedProducts;
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    throw err;
  }
}
