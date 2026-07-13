import { supabase } from '../lib/supabase';
import { Product } from '../../App';

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
    const mappedProducts = data.map((row: any, index: number): Product => {
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

    // Featured products that should appear first on the homepage
    const featuredNames = [
      'AF135mm F1.8 Nikon (Z Mount) - Black',
      '35mm T2.0 Nikon (Z Mount) - Black',
      '50mm T2.0 Sony (E Mount) - Black',
      '50mm F1.2 Nikon (Z Mount) - Black',
      'AF40mm F2.5 Sony (E Mount) - Black',
      'AF35mm F1.8 Nikon (Z Mount) - Black',
      'AF35mm F1.8 Sony (E Mount) - Black',
      '35mm F1.4 Canon (EOS-R Mount) mark iii FF - Black',
      'AF24mm F1.8 Sony (E Mount) - Black',
      'AF50mm F1.8 Nikon (Z Mount) - Black',
      'Autofocus adapter for Canon EF - Nikon Z - Black',
      'PL 4-in-1 Lens Adapter compatible with E / L / RF / Z Mount - Silver',
      '77mm True Color VND6-9 Filter - Black',
      '55mm 1/8 Black Mist Filter - Black'
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
