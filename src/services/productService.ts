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
    isPreorder: item.isPreorder === true
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
    image: formData.image,
    gallery: formData.gallery && formData.gallery.length > 0 ? formData.gallery : [formData.image],
    inStock: formData.inStock !== false,
    desc: formData.desc || '',
    stars: formData.stars || 5,
    specs: JSON.stringify(formData.specs || [formData.brand, formData.mount].filter(Boolean))
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
  if (formData.image !== undefined) payload.image = formData.image;
  if (formData.gallery !== undefined) payload.gallery = formData.gallery;
  if (formData.inStock !== undefined) payload.inStock = formData.inStock;
  if (formData.desc !== undefined) payload.desc = formData.desc;
  if (formData.stars !== undefined) payload.stars = formData.stars;
  if (formData.specs !== undefined) {
    payload.specs = Array.isArray(formData.specs) ? JSON.stringify(formData.specs) : formData.specs;
  }

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
