import { supabase } from '../lib/supabase';
import { Product } from '../../App';

export interface ProductFormData {
  id?: number;
  name: string;
  price: number;
  oldPrice?: number;
  rentPrice?: number;
  category: string;
  brand?: string;
  product_group?: 'new' | 'used';
  product_type?: 'lens' | 'camera' | 'light' | 'filter' | 'adapter' | 'accessory';
  mount?: string;
  image: string;
  gallery?: string[];
  inStock: boolean;
  isPreorder?: boolean;
  desc?: string;
  stars?: number;
  specs?: string[];
  promoEligible?: boolean;
  condition_rating?: string;
  technical_specs?: Record<string, unknown>;
  used_attributes?: Record<string, unknown>;
  seo_title?: string;
  meta_description?: string;
  seo_intro?: string;
  seo_description?: string;
  custom_faq?: Array<{ question: string; answer: string }>;
  search_aliases?: string[];
  active?: boolean;
}

export const fetchAdminProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products gearshop')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching products for admin:', error);
    throw error;
  }

  return (data || []).map((item: Record<string, unknown>) => ({
    id: Number(item.id),
    name: String(item.name || ''),
    price: Number(item.price) || 0,
    oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
    rentPrice: item.rentPrice ? Number(item.rentPrice) : undefined,
    category: String(item.category || 'Accessoires'),
    brand: String(item.brand || '7Artisans'),
    product_group: (item.product_group as 'new' | 'used') || 'new',
    product_type: (item.product_type as 'lens' | 'camera' | 'light' | 'filter' | 'adapter' | 'accessory') || 'lens',
    mount: item.mount ? String(item.mount) : undefined,
    image: String(item.image || 'https://via.placeholder.com/400'),
    gallery: Array.isArray(item.gallery) ? item.gallery.map(String) : (item.image ? [String(item.image)] : []),
    inStock: item.inStock !== false,
    desc: String(item.desc || ''),
    stars: Number(item.stars) || 5,
    specs: Array.isArray(item.specs) ? item.specs.map(String) : [],
    isPreorder: item.isPreorder === true,
    seo_title: item.seo_title ? String(item.seo_title) : undefined,
    meta_description: item.meta_description ? String(item.meta_description) : undefined,
    seo_intro: item.seo_intro ? String(item.seo_intro) : undefined,
    search_aliases: Array.isArray(item.search_aliases) ? item.search_aliases.map(String) : undefined,
    technical_specs: typeof item.technical_specs === 'object' && item.technical_specs ? item.technical_specs as Record<string, unknown> : undefined,
    used_attributes: typeof item.used_attributes === 'object' && item.used_attributes ? item.used_attributes as Record<string, unknown> : undefined,
  }));
};

export const createProductRecord = async (formData: ProductFormData): Promise<Product> => {
  const nextId = formData.id || Date.now();
  const payload: Record<string, unknown> = {
    id: nextId,
    name: formData.name,
    price: formData.price,
    oldPrice: formData.oldPrice || null,
    rentPrice: formData.rentPrice || null,
    category: formData.category,
    brand: formData.brand || null,
    product_group: formData.product_group || 'new',
    product_type: formData.product_type || 'lens',
    mount: formData.mount || null,
    image: formData.image,
    gallery: formData.gallery && formData.gallery.length > 0 ? formData.gallery : [formData.image],
    inStock: formData.inStock !== false,
    isPreorder: formData.isPreorder === true,
    desc: formData.desc || '',
    stars: formData.stars || 5,
    specs: JSON.stringify(formData.specs || [formData.brand, formData.mount].filter(Boolean)),
    condition_rating: formData.condition_rating || null,
    technical_specs: formData.technical_specs || {},
    used_attributes: formData.used_attributes || {},
    seo_title: formData.seo_title || null,
    meta_description: formData.meta_description || null,
    seo_intro: formData.seo_intro || null,
    seo_description: formData.seo_description || null,
    custom_faq: formData.custom_faq || [],
    search_aliases: formData.search_aliases || [],
    active: formData.active !== false,
  };

  const { data, error } = await supabase
    .from('products gearshop')
    .insert([payload])
    .select();

  if (error) {
    console.error('Error creating product record:', error);
    throw error;
  }

  const created = data && data[0] ? data[0] : payload;
  return {
    id: Number(created.id),
    name: String(created.name),
    price: Number(created.price) || 0,
    oldPrice: created.oldPrice ? Number(created.oldPrice) : undefined,
    rentPrice: created.rentPrice ? Number(created.rentPrice) : undefined,
    category: String(created.category || 'Accessoires'),
    brand: formData.brand || '7Artisans',
    product_group: formData.product_group || 'new',
    product_type: formData.product_type || 'lens',
    mount: formData.mount,
    image: String(created.image),
    gallery: Array.isArray(created.gallery) ? created.gallery.map(String) : [String(created.image)],
    inStock: created.inStock !== false,
    desc: String(created.desc || ''),
    stars: Number(created.stars) || 5,
    specs: Array.isArray(created.specs) ? created.specs : [],
    isPreorder: formData.isPreorder === true
  };
};

export const updateProductRecord = async (id: number, formData: Partial<ProductFormData>): Promise<void> => {
  const payload: Record<string, unknown> = {};
  if (formData.name !== undefined) payload.name = formData.name;
  if (formData.price !== undefined) payload.price = formData.price;
  if (formData.oldPrice !== undefined) payload.oldPrice = formData.oldPrice || null;
  if (formData.rentPrice !== undefined) payload.rentPrice = formData.rentPrice || null;
  if (formData.category !== undefined) payload.category = formData.category;
  if (formData.brand !== undefined) payload.brand = formData.brand || null;
  if (formData.product_group !== undefined) payload.product_group = formData.product_group;
  if (formData.product_type !== undefined) payload.product_type = formData.product_type;
  if (formData.mount !== undefined) payload.mount = formData.mount || null;
  if (formData.image !== undefined) payload.image = formData.image;
  if (formData.gallery !== undefined) payload.gallery = formData.gallery;
  if (formData.inStock !== undefined) payload.inStock = formData.inStock;
  if (formData.isPreorder !== undefined) payload.isPreorder = formData.isPreorder;
  if (formData.desc !== undefined) payload.desc = formData.desc;
  if (formData.stars !== undefined) payload.stars = formData.stars;
  if (formData.specs !== undefined) {
    payload.specs = Array.isArray(formData.specs) ? JSON.stringify(formData.specs) : formData.specs;
  }
  if (formData.condition_rating !== undefined) payload.condition_rating = formData.condition_rating || null;
  if (formData.technical_specs !== undefined) payload.technical_specs = formData.technical_specs;
  if (formData.used_attributes !== undefined) payload.used_attributes = formData.used_attributes;
  if (formData.seo_title !== undefined) payload.seo_title = formData.seo_title || null;
  if (formData.meta_description !== undefined) payload.meta_description = formData.meta_description || null;
  if (formData.seo_intro !== undefined) payload.seo_intro = formData.seo_intro || null;
  if (formData.seo_description !== undefined) payload.seo_description = formData.seo_description || null;
  if (formData.custom_faq !== undefined) payload.custom_faq = formData.custom_faq;
  if (formData.search_aliases !== undefined) payload.search_aliases = formData.search_aliases;
  if (formData.active !== undefined) payload.active = formData.active;

  const { error } = await supabase
    .from('products gearshop')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const toggleProductStockStatus = async (id: number, currentInStock: boolean): Promise<boolean> => {
  const newStatus = !currentInStock;
  const { error } = await supabase
    .from('products gearshop')
    .update({ inStock: newStatus })
    .eq('id', id);

  if (error) {
    console.error(`Error toggling stock for product ${id}:`, error);
    throw error;
  }

  return newStatus;
};

export const deleteProductRecord = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('products gearshop')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};
