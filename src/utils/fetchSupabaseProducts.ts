import { supabase } from '../lib/supabase';
import { Product } from '../../App';

export async function fetchSupabaseProducts(): Promise<Product[]> {
  try {
    const fetchPromise = supabase
      .from('products_gearshop')
      .select('*')
      .order('id', { ascending: true });

    // 5-second timeout to prevent infinite loading spinner
    const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timed out after 5 seconds')), 5000)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Supabase error fetching products:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Helper to parse strings that might be JSON arrays or comma separated
    const parseArraySafe = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [val];
        } catch (e) {
          return val.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      return [];
    };

    // Map Supabase rows to our Product interface
    return data.map((row: any, index: number): Product => {
      const gallery = parseArraySafe(row.gallery);
      const specs = parseArraySafe(row.specs);

      return {
        id: Number(row.id) || (index + 1000), // fallback ID if missing
        name: String(row.name || ''),
        price: Number(row.price) || 0,
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
        promoEligible: row.promoEligible === true || row.promoeligible === true || row.promoeligible === 'TRUE' || row.promoeligible === 'true',
      };
    });
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    throw err;
  }
}
