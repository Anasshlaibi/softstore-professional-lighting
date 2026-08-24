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
  condition_rating?: string;
  technical_specs?: Record<string, any>;
  used_attributes?: Record<string, any>;
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

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price) || 0,
    oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
    rentPrice: item.rentPrice ? Number(item.rentPrice) : undefined,
    category: item.category || 'Accessoires',
    brand: item.brand || '7Artisans',
    product_group: item.product_group || 'new',
    product_type: item.product_type || 'lens',
    mount: item.mount,
    image: item.image || 'https://via.placeholder.com/400',
    gallery: Array.isArray(item.gallery) ? item.gallery : (item.image ? [item.image] : []),
    inStock: item.inStock !== false,
    desc: item.desc || '',
    stars: item.stars || 5,
    specs: Array.isArray(item.specs) ? item.specs : [],
    isPreorder: item.isPreorder === true
  }));
};

export const createProductRecord = async (formData: ProductFormData): Promise<Product> => {
  const nextId = formData.id || Date.now();
  const payload = {
    id: nextId,
    name: formData.name,
    price: formData.price,
    oldPrice: formData.oldPrice || null,
    rentPrice: formData.rentPrice || null,
    category: formData.category,
    brand: formData.brand || '7Artisans',
    product_group: formData.product_group || 'new',
    product_type: formData.product_type || 'lens',
    mount: formData.mount || null,
    image: formData.image,
    gallery: formData.gallery || [formData.image],
    inStock: formData.inStock,
    desc: formData.desc || '',
    stars: formData.stars || 5,
    condition_rating: formData.condition_rating || null,
    technical_specs: formData.technical_specs || {},
    used_attributes: formData.used_attributes || {},
    active: formData.active !== false
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
    id: created.id,
    name: created.name,
    price: Number(created.price) || 0,
    oldPrice: created.oldPrice ? Number(created.oldPrice) : undefined,
    rentPrice: created.rentPrice ? Number(created.rentPrice) : undefined,
    category: created.category,
    brand: created.brand,
    product_group: created.product_group,
    product_type: created.product_type,
    mount: created.mount,
    image: created.image,
    gallery: created.gallery || [created.image],
    inStock: created.inStock !== false,
    desc: created.desc,
    stars: created.stars || 5,
    specs: Array.isArray(created.specs) ? created.specs : [],
    isPreorder: created.isPreorder === true
  };
};

export const updateProductRecord = async (id: number, formData: Partial<ProductFormData>): Promise<void> => {
  const payload: Record<string, any> = {};
  if (formData.name !== undefined) payload.name = formData.name;
  if (formData.price !== undefined) payload.price = formData.price;
  if (formData.oldPrice !== undefined) payload.oldPrice = formData.oldPrice;
  if (formData.rentPrice !== undefined) payload.rentPrice = formData.rentPrice;
  if (formData.category !== undefined) payload.category = formData.category;
  if (formData.brand !== undefined) payload.brand = formData.brand;
  if (formData.product_group !== undefined) payload.product_group = formData.product_group;
  if (formData.product_type !== undefined) payload.product_type = formData.product_type;
  if (formData.mount !== undefined) payload.mount = formData.mount;
  if (formData.image !== undefined) payload.image = formData.image;
  if (formData.gallery !== undefined) payload.gallery = formData.gallery;
  if (formData.inStock !== undefined) payload.inStock = formData.inStock;
  if (formData.desc !== undefined) payload.desc = formData.desc;
  if (formData.stars !== undefined) payload.stars = formData.stars;
  if (formData.condition_rating !== undefined) payload.condition_rating = formData.condition_rating;
  if (formData.technical_specs !== undefined) payload.technical_specs = formData.technical_specs;
  if (formData.used_attributes !== undefined) payload.used_attributes = formData.used_attributes;
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
