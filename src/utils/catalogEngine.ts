/**
 * catalogEngine.ts
 *
 * Central catalog engine that derives all brand, category, compatibility,
 * use-case, and recommendation data from the existing product array.
 *
 * PRINCIPLE: Single source of truth — all data flows from the Supabase
 * `products gearshop` table. Nothing is fabricated.
 */

import { Product } from '../../App';
import { extractProductAttributes, ProductAttributes } from './productMetadata';

// ============================================================
// TYPES
// ============================================================

export interface CatalogBrand {
  name: string;
  slug: string;
  alternateNames: string[];
  productCount: number;
  categories: string[];
  mounts: string[];
  priceRange: { min: number; max: number };
  productIds: number[];
  url: string;
}

export interface CatalogCategory {
  name: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  productCount: number;
  brands: string[];
  priceRange: { min: number; max: number };
  productIds: number[];
  url: string;
}

export interface UseCase {
  id: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  description: string;
  productIds: number[];
  productCount: number;
  url: string;
}

export interface ProductRecommendation {
  productId: number;
  alternatives: number[];
  compatibleAccessories: number[];
  relatedProducts: number[];
  bestFor: string[];
  compatibleSystems: string[];
}

export interface CatalogIndex {
  brands: CatalogBrand[];
  categories: CatalogCategory[];
  useCases: UseCase[];
  recommendations: Map<number, ProductRecommendation>;
  updatedAt: string;
}

// ============================================================
// CONSTANTS — Multilingual Category Taxonomy
// ============================================================

const CATEGORY_TAXONOMY: Record<string, { fr: string; en: string; ar: string; slug: string }> = {
  'lenses': { fr: 'Objectifs', en: 'Lenses', ar: 'عدسات', slug: 'objectifs' },
  'studio': { fr: 'Éclairage Studio', en: 'Studio Lighting', ar: 'إضاءة استوديو', slug: 'eclairage-studio' },
  'portable': { fr: 'Éclairage Portable', en: 'Portable Lighting', ar: 'إضاءة محمولة', slug: 'eclairage-portable' },
  'accessories': { fr: 'Accessoires & Filtres', en: 'Accessories & Filters', ar: 'ملحقات وفلاتر', slug: 'accessoires' },
  'occasion': { fr: 'Occasion', en: 'Used Equipment', ar: 'معدات مستعملة', slug: 'occasion' },
  'cameras': { fr: 'Caméras', en: 'Cameras', ar: 'كاميرات', slug: 'cameras' },
  'filters': { fr: 'Filtres', en: 'Filters', ar: 'فلاتر', slug: 'filtres' },
  'lighting': { fr: 'Éclairage', en: 'Lighting', ar: 'إضاءة', slug: 'eclairage' },
  'dji': { fr: 'DJI', en: 'DJI', ar: 'DJI', slug: 'dji' },
  'audio': { fr: 'Audio', en: 'Audio', ar: 'صوتيات', slug: 'audio' },
};

const BRAND_ALTERNATE_NAMES: Record<string, string[]> = {
  '7Artisans': ['7artisans', 'Seven Artisans', '7 Artisans'],
  'K&F Concept': ['KF Concept', 'K&F', 'KF', 'Kent Faith'],
  'Sony': ['Sony Alpha', 'Sony Cinema Line'],
  'Canon': ['Canon EOS', 'Canon RF'],
  'Nikon': ['Nikon Z'],
  'DJI': ['DJI Osmo', 'DJI Action'],
  'Panasonic': ['Panasonic Lumix', 'Lumix'],
  'Fujifilm': ['Fuji', 'Fujifilm X'],
  'Godox': ['Godox Photo'],
  'GoPro': ['GoPro Hero'],
  'Røde': ['Rode', 'RØDE'],
  'SmallRig': ['Smallrig'],
};

// ============================================================
// USE CASE DEFINITIONS — Only applied when product specs support them
// ============================================================

interface UseCaseRule {
  id: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  description: string;
  matchFn: (p: Product, attrs: ProductAttributes) => boolean;
}

const USE_CASE_RULES: UseCaseRule[] = [
  {
    id: 'videographers',
    nameFr: 'Équipement pour Vidéastes',
    nameEn: 'Equipment for Videographers',
    nameAr: 'معدات للمصورين بالفيديو',
    description: 'Matériel professionnel sélectionné pour la production vidéo au Maroc.',
    matchFn: (p, attrs) =>
      attrs.lens_type === 'cinema' ||
      attrs.product_type === 'light' ||
      (attrs.product_type === 'filter' && /nd|vnd/i.test(p.name)) ||
      /video|vidéo|film|cinema|cinéma/i.test(`${p.name} ${p.desc}`),
  },
  {
    id: 'photographers',
    nameFr: 'Équipement pour Photographes',
    nameEn: 'Equipment for Photographers',
    nameAr: 'معدات للمصورين',
    description: 'Objectifs, filtres et accessoires pour la photographie professionnelle.',
    matchFn: (p, attrs) =>
      attrs.product_type === 'lens' ||
      attrs.product_type === 'filter' ||
      (attrs.product_type === 'accessory' && /photo|portrait|paysage/i.test(`${p.name} ${p.desc}`)),
  },
  {
    id: 'filmmakers',
    nameFr: 'Équipement pour Cinéastes',
    nameEn: 'Equipment for Filmmakers',
    nameAr: 'معدات للسينمائيين',
    description: 'Lentilles cinéma, éclairage et accessoires pour les productions cinématographiques.',
    matchFn: (p, attrs) =>
      attrs.lens_type === 'cinema' ||
      (attrs.product_type === 'light' && Number(p.price) >= 2000) ||
      /cinema|cinéma|court-métrage|film|narrative/i.test(`${p.name} ${p.desc}`),
  },
  {
    id: 'content-creators',
    nameFr: 'Équipement pour Créateurs de Contenu',
    nameEn: 'Equipment for Content Creators',
    nameAr: 'معدات لصناع المحتوى',
    description: 'Matériel compact et polyvalent pour YouTube, réseaux sociaux et vlogs.',
    matchFn: (p, attrs) =>
      /vlog|youtube|content|créateur|pocket|portable|compact/i.test(`${p.name} ${p.desc} ${p.category}`) ||
      (attrs.product_type === 'light' && Number(p.price) < 1500),
  },
  {
    id: 'interviews',
    nameFr: 'Équipement pour Interviews',
    nameEn: 'Equipment for Interviews',
    nameAr: 'معدات للمقابلات',
    description: 'Éclairage, optiques et micros adaptés à la captation d\'interviews.',
    matchFn: (p, attrs) =>
      attrs.product_type === 'light' ||
      (attrs.product_type === 'lens' && /50mm|85mm|35mm/i.test(p.name)) ||
      attrs.product_type === 'audio' ||
      /interview|softbox|panneau|panel/i.test(`${p.name} ${p.desc}`),
  },
  {
    id: 'weddings',
    nameFr: 'Équipement pour Mariages',
    nameEn: 'Equipment for Weddings',
    nameAr: 'معدات لحفلات الزفاف',
    description: 'Objectifs lumineux et éclairage portable pour la photographie de mariage.',
    matchFn: (p, attrs) =>
      (attrs.product_type === 'lens' && attrs.focus_type === 'autofocus') ||
      (attrs.product_type === 'lens' && /f\/?1\.[248]/i.test(p.name)) ||
      (attrs.product_type === 'light' && /portable/i.test(p.category || '')),
  },
];

// ============================================================
// HELPERS
// ============================================================

export function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[&]/g, '-and-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function getCategoryInfo(rawCategory: string) {
  const key = rawCategory.toLowerCase().trim();
  return CATEGORY_TAXONOMY[key] || {
    fr: rawCategory,
    en: rawCategory,
    ar: rawCategory,
    slug: slugify(rawCategory),
  };
}

// ============================================================
// MAIN ENGINE
// ============================================================

/**
 * Build a complete catalog index from the product array.
 * This is the single entry point — call it once when products are loaded.
 */
export function buildCatalogIndex(products: Product[]): CatalogIndex {
  const safeProducts = Array.isArray(products) ? products : [];
  const attributesMap = new Map<number, ProductAttributes>();
  safeProducts.forEach(p => {
    if (p && p.id) {
      attributesMap.set(p.id, extractProductAttributes(p));
    }
  });

  const brands = extractBrands(safeProducts, attributesMap);
  const categories = extractCategories(safeProducts, attributesMap);
  const useCases = extractUseCases(safeProducts, attributesMap);
  const recommendations = buildRecommendations(safeProducts, attributesMap);

  return {
    brands,
    categories,
    useCases,
    recommendations,
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================
// BRAND EXTRACTION
// ============================================================

function extractBrands(products: Product[], attrs: Map<number, ProductAttributes>): CatalogBrand[] {
  const brandMap = new Map<string, {
    products: Product[];
    categories: Set<string>;
    mounts: Set<string>;
  }>();

  products.forEach(p => {
    const a = attrs.get(p.id);
    const brandName = a?.brand || '7Artisans';

    if (!brandMap.has(brandName)) {
      brandMap.set(brandName, { products: [], categories: new Set(), mounts: new Set() });
    }
    const entry = brandMap.get(brandName)!;
    entry.products.push(p);
    if (p.category) entry.categories.add(p.category);
    if (a?.mount && a.mount !== 'Universel') entry.mounts.add(a.mount);
  });

  return Array.from(brandMap.entries()).map(([name, data]) => {
    const prices = data.products.map(p => p.price).filter(p => p > 0);
    return {
      name,
      slug: slugify(name),
      alternateNames: BRAND_ALTERNATE_NAMES[name] || [name.toLowerCase()],
      productCount: data.products.length,
      categories: Array.from(data.categories),
      mounts: Array.from(data.mounts),
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
      },
      productIds: data.products.map(p => p.id),
      url: `https://gearshop.ma/marque/${slugify(name)}`,
    };
  }).sort((a, b) => b.productCount - a.productCount);
}

// ============================================================
// CATEGORY EXTRACTION
// ============================================================

function extractCategories(products: Product[], attrs: Map<number, ProductAttributes>): CatalogCategory[] {
  const catMap = new Map<string, {
    products: Product[];
    brands: Set<string>;
  }>();

  products.forEach(p => {
    const raw = (p.category || 'accessories').toLowerCase().trim();
    if (!catMap.has(raw)) {
      catMap.set(raw, { products: [], brands: new Set() });
    }
    const entry = catMap.get(raw)!;
    entry.products.push(p);
    const a = attrs.get(p.id);
    if (a?.brand) entry.brands.add(a.brand);
  });

  // Also create virtual categories from product_type
  const virtualCategories = new Map<string, { products: Product[]; brands: Set<string> }>();

  products.forEach(p => {
    const a = attrs.get(p.id);
    if (!a) return;

    // Filters virtual category
    if (a.product_type === 'filter') {
      if (!virtualCategories.has('filters')) {
        virtualCategories.set('filters', { products: [], brands: new Set() });
      }
      const entry = virtualCategories.get('filters')!;
      entry.products.push(p);
      if (a.brand) entry.brands.add(a.brand);
    }

    // Cinema lenses virtual category
    if (a.lens_type === 'cinema') {
      if (!virtualCategories.has('cinema-lenses')) {
        virtualCategories.set('cinema-lenses', { products: [], brands: new Set() });
      }
      const entry = virtualCategories.get('cinema-lenses')!;
      entry.products.push(p);
      if (a.brand) entry.brands.add(a.brand);
    }

    // Combined lighting virtual category
    if (a.product_type === 'light') {
      if (!virtualCategories.has('lighting')) {
        virtualCategories.set('lighting', { products: [], brands: new Set() });
      }
      const entry = virtualCategories.get('lighting')!;
      entry.products.push(p);
      if (a.brand) entry.brands.add(a.brand);
    }
  });

  // Merge virtual categories
  virtualCategories.forEach((data, key) => {
    if (!catMap.has(key) && data.products.length >= 2) {
      catMap.set(key, data);
    }
  });

  return Array.from(catMap.entries()).map(([rawKey, data]) => {
    const info = getCategoryInfo(rawKey);
    const prices = data.products.map(p => p.price).filter(p => p > 0);
    return {
      name: rawKey,
      slug: info.slug,
      nameFr: info.fr,
      nameEn: info.en,
      nameAr: info.ar,
      productCount: data.products.length,
      brands: Array.from(data.brands),
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
      },
      productIds: data.products.map(p => p.id),
      url: `https://gearshop.ma/categorie/${info.slug}`,
    };
  }).sort((a, b) => b.productCount - a.productCount);
}

// ============================================================
// USE CASE EXTRACTION
// ============================================================

function extractUseCases(products: Product[], attrs: Map<number, ProductAttributes>): UseCase[] {
  return USE_CASE_RULES
    .map(rule => {
      const matchingIds = products
        .filter(p => {
          const a = attrs.get(p.id);
          return a && rule.matchFn(p, a);
        })
        .map(p => p.id);

      return {
        id: rule.id,
        nameFr: rule.nameFr,
        nameEn: rule.nameEn,
        nameAr: rule.nameAr,
        slug: rule.id,
        description: rule.description,
        productIds: matchingIds,
        productCount: matchingIds.length,
        url: `https://gearshop.ma/guide/${rule.id}`,
      };
    })
    .filter(uc => uc.productCount >= 3); // Only include use cases with enough products
}

// ============================================================
// RECOMMENDATION ENGINE
// ============================================================

function buildRecommendations(
  products: Product[],
  attrs: Map<number, ProductAttributes>
): Map<number, ProductRecommendation> {
  const recommendations = new Map<number, ProductRecommendation>();

  products.forEach(product => {
    const myAttrs = attrs.get(product.id);
    if (!myAttrs) return;

    // Find alternatives: same product_type + similar specs, different product
    const alternatives = products
      .filter(p => {
        if (p.id === product.id) return false;
        const theirAttrs = attrs.get(p.id);
        if (!theirAttrs) return false;
        if (theirAttrs.product_type !== myAttrs.product_type) return false;

        // For lenses: match by focal length or similar aperture
        if (myAttrs.product_type === 'lens') {
          const sameFocal = myAttrs.focal_length && theirAttrs.focal_length &&
            myAttrs.focal_length === theirAttrs.focal_length;
          const sameMount = myAttrs.mount === theirAttrs.mount;
          const sameLensType = myAttrs.lens_type === theirAttrs.lens_type;
          return sameFocal || (sameMount && sameLensType);
        }

        // For lights: match by similar power or category
        if (myAttrs.product_type === 'light') {
          return product.category === p.category;
        }

        // For filters: match by same type
        if (myAttrs.product_type === 'filter') {
          return true;
        }

        return product.category === p.category;
      })
      .slice(0, 4)
      .map(p => p.id);

    // Find compatible accessories
    const compatibleAccessories = products
      .filter(p => {
        if (p.id === product.id) return false;
        const theirAttrs = attrs.get(p.id);
        if (!theirAttrs) return false;

        const pNameLower = p.name.toLowerCase();

        // 1. If Camera: suggest Cage, Memory Card, Battery, Audio Mic, Stabilizer, Lens
        if (myAttrs.product_type === 'camera') {
          if (pNameLower.includes('cage') || pNameLower.includes('matte box') || pNameLower.includes('rig')) {
            if (myAttrs.brand === 'Sony' && pNameLower.includes('sony')) return true;
            if (myAttrs.brand === 'Canon' && pNameLower.includes('canon')) return true;
            if (myAttrs.brand === 'Nikon' && pNameLower.includes('nikon')) return true;
            return true;
          }
          if (theirAttrs.product_type === 'audio' || pNameLower.includes('lark') || pNameLower.includes('mic')) return true;
          if (pNameLower.includes('carte') || pNameLower.includes('sd') || pNameLower.includes('cfexpress') || pNameLower.includes('pny')) return true;
          if (pNameLower.includes('batterie') || pNameLower.includes('chargeur')) {
            if (myAttrs.brand === 'Sony' && pNameLower.includes('sony')) return true;
            if (myAttrs.brand === 'Canon' && pNameLower.includes('canon')) return true;
            return true;
          }
          if (pNameLower.includes('trépied') || pNameLower.includes('stabilisateur') || pNameLower.includes('osmo') || pNameLower.includes('vanguard')) return true;
          if (theirAttrs.product_type === 'light') return true;
          if (theirAttrs.product_type === 'lens' && (theirAttrs.mount === myAttrs.mount || (myAttrs.brand === 'Sony' && theirAttrs.mount === 'Sony E') || (myAttrs.brand === 'Canon' && theirAttrs.mount.includes('Canon')) || (myAttrs.brand === 'Nikon' && theirAttrs.mount === 'Nikon Z'))) return true;
        }

        // 2. If Lens: suggest Filters, Lens Support, Bags, Adapters
        if (myAttrs.product_type === 'lens') {
          if (theirAttrs.product_type === 'filter') {
            if (myAttrs.filter_diameter && theirAttrs.filter_diameter) {
              return myAttrs.filter_diameter === theirAttrs.filter_diameter;
            }
            return true;
          }
          if (pNameLower.includes('support') || pNameLower.includes('lws') || pNameLower.includes('bague') || theirAttrs.product_type === 'adapter') return true;
          if (pNameLower.includes('sac') || pNameLower.includes('vesta') || pNameLower.includes('veo')) return true;
        }

        // 3. If Light: suggest Softboxes, Stands, Batteries
        if (myAttrs.product_type === 'light') {
          if (pNameLower.includes('softbox') || pNameLower.includes('boite') || pNameLower.includes('support') || pNameLower.includes('pied') || pNameLower.includes('trépied')) return true;
          if (pNameLower.includes('batterie') || pNameLower.includes('chargeur')) return true;
        }

        // 4. If Audio: suggest Accessories, Adapters, Wind muffs, Cables
        if (myAttrs.product_type === 'audio') {
          if (pNameLower.includes('cold shoe') || pNameLower.includes('support') || pNameLower.includes('câble') || pNameLower.includes('adaptateur')) return true;
        }

        // Generic accessories
        if (theirAttrs.product_type === 'accessory' && !pNameLower.includes('appareil')) return true;

        return false;
      })
      .slice(0, 6)
      .map(p => p.id);

    // Related products: same category or mount
    const relatedProducts = products
      .filter(p => {
        if (p.id === product.id) return false;
        if (alternatives.includes(p.id)) return false;
        if (compatibleAccessories.includes(p.id)) return false;
        return product.category === p.category ||
          (myAttrs.mount && myAttrs.mount !== 'Universel' &&
            attrs.get(p.id)?.mount === myAttrs.mount);
      })
      .slice(0, 4)
      .map(p => p.id);

    // "Best for" use cases — derived from specs
    const bestFor: string[] = [];
    if (myAttrs.lens_type === 'cinema') {
      bestFor.push('Cinéma', 'Court-métrage', 'Production vidéo');
    }
    if (myAttrs.lens_type === 'autofocus') {
      bestFor.push('Photographie', 'Événementiel');
      if (myAttrs.focal_length) {
        const focal = parseInt(myAttrs.focal_length);
        if (focal <= 24) bestFor.push('Paysage', 'Architecture', 'Vlog');
        if (focal >= 35 && focal <= 85) bestFor.push('Portrait', 'Mariage');
        if (focal >= 100) bestFor.push('Portrait serré', 'Sport');
      }
    }
    if (myAttrs.product_type === 'light') {
      bestFor.push('Éclairage studio', 'Interview');
      if ((product.category || '').includes('portable')) bestFor.push('Tournage extérieur');
    }
    if (myAttrs.product_type === 'filter') {
      const pName = product.name.toLowerCase();
      if (pName.includes('nd') || pName.includes('vnd')) bestFor.push('Vidéo', 'Filmmaking');
      if (pName.includes('cpl')) bestFor.push('Paysage', 'Architecture');
      if (pName.includes('black mist')) bestFor.push('Cinéma', 'Portrait');
      if (pName.includes('uv')) bestFor.push('Protection optique');
    }

    // Compatible systems
    const compatibleSystems: string[] = [];
    if (myAttrs.mount && myAttrs.mount !== 'Universel') {
      compatibleSystems.push(myAttrs.mount);
    }
    // Some products (adapters, filters) are multi-system
    const text = `${product.name} ${product.desc}`.toLowerCase();
    if (text.includes('sony e')) compatibleSystems.push('Sony E');
    if (text.includes('canon rf') || text.includes('eos-r')) compatibleSystems.push('Canon RF');
    if (text.includes('nikon z')) compatibleSystems.push('Nikon Z');
    if (text.includes('fuji') || text.includes('fx mount')) compatibleSystems.push('Fujifilm X');
    if (text.includes('l mount') || text.includes('l-mount')) compatibleSystems.push('L-Mount');
    // Deduplicate
    const uniqueSystems = [...new Set(compatibleSystems)];

    recommendations.set(product.id, {
      productId: product.id,
      alternatives,
      compatibleAccessories,
      relatedProducts,
      bestFor: [...new Set(bestFor)],
      compatibleSystems: uniqueSystems,
    });
  });

  return recommendations;
}

// ============================================================
// CONVENIENCE & ACCESSOR FUNCTIONS
// ============================================================

export function getBrands(products: Product[]): CatalogBrand[] {
  const index = buildCatalogIndex(products);
  return index.brands;
}

export function getCategories(products: Product[]): CatalogCategory[] {
  const index = buildCatalogIndex(products);
  return index.categories;
}

export function getUseCases(products: Product[]): UseCase[] {
  const index = buildCatalogIndex(products);
  return index.useCases;
}

export function getBrandBySlug(products: Product[], slug: string): CatalogBrand | undefined {
  const normalized = slugify(slug);
  const brands = getBrands(products);
  return brands.find(b => b.slug === normalized || slugify(b.name) === normalized);
}

export function getCategoryBySlug(products: Product[], slug: string): CatalogCategory | undefined {
  const normalized = slugify(slug);
  const categories = getCategories(products);
  return categories.find(c => c.slug === normalized || slugify(c.name) === normalized || slugify(c.nameFr) === normalized || slugify(c.nameEn) === normalized);
}

export function getUseCaseBySlug(products: Product[], slug: string): UseCase | undefined {
  const normalized = slugify(slug);
  const useCases = getUseCases(products);
  return useCases.find(u => u.slug === normalized || u.id === normalized);
}

export function getRecommendationsForProduct(products: Product[], productId: number): ProductRecommendation | undefined {
  const index = buildCatalogIndex(products);
  return index.recommendations.get(productId);
}

export function findCompatibleAccessories(arg1: Product[] | Product, arg2: Product[] | Product): Product[] {
  const products = Array.isArray(arg1) ? arg1 : (Array.isArray(arg2) ? arg2 : []);
  const product = !Array.isArray(arg1) ? arg1 : (!Array.isArray(arg2) ? arg2 : null);
  if (!product || products.length === 0) return [];
  const rec = getRecommendationsForProduct(products, product.id);
  if (!rec || !rec.compatibleAccessories.length) return [];
  return products.filter(p => rec.compatibleAccessories.includes(p.id));
}

export function findAlternativeProducts(arg1: Product[] | Product, arg2: Product[] | Product): Product[] {
  const products = Array.isArray(arg1) ? arg1 : (Array.isArray(arg2) ? arg2 : []);
  const product = !Array.isArray(arg1) ? arg1 : (!Array.isArray(arg2) ? arg2 : null);
  if (!product || products.length === 0) return [];
  const rec = getRecommendationsForProduct(products, product.id);
  if (!rec || !rec.alternatives.length) return [];
  return products.filter(p => rec.alternatives.includes(p.id));
}

export function getRelatedProducts(arg1: Product[] | Product, arg2: Product[] | Product): Product[] {
  const products = Array.isArray(arg1) ? arg1 : (Array.isArray(arg2) ? arg2 : []);
  const product = !Array.isArray(arg1) ? arg1 : (!Array.isArray(arg2) ? arg2 : null);
  if (!product || products.length === 0) return [];
  const rec = getRecommendationsForProduct(products, product.id);
  if (!rec || !rec.relatedProducts.length) {
    return products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
  }
  return products.filter(p => rec.relatedProducts.includes(p.id));
}

export interface SearchIntent {
  type: 'transactional' | 'commercial' | 'informational' | 'compatibility';
  brand?: string;
  category?: string;
  mount?: string;
  useCase?: string;
  market: 'morocco';
}

/**
 * Map a user query to structured search intent.
 */
export function parseSearchIntent(query: string): SearchIntent {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const intent: SearchIntent = { type: 'informational', market: 'morocco' };

  // Detect transactional intent
  if (/acheter|buy|prix|price|شراء|commander/i.test(q)) {
    intent.type = 'transactional';
  }
  // Detect commercial investigation
  else if (/meilleur|best|comparatif|compare|مقارنة|avis|review/i.test(q)) {
    intent.type = 'commercial';
  }
  // Detect compatibility queries
  else if (/compatible|monture|mount|pour|for|متوافق/i.test(q)) {
    intent.type = 'compatibility';
  }

  // Detect brand
  const brandPatterns: Record<string, RegExp> = {
    'Sony': /sony|سوني/i,
    'Canon': /canon|كانون/i,
    'Nikon': /nikon|نيكون/i,
    'DJI': /dji|osmo/i,
    '7Artisans': /7artisans|7 artisans/i,
    'K&F Concept': /k&f|kf concept|kf/i,
    'Fujifilm': /fuji|fujifilm|فوجي/i,
    'Panasonic': /lumix|panasonic|لومكس/i,
    'Godox': /godox/i,
  };
  for (const [brand, pattern] of Object.entries(brandPatterns)) {
    if (pattern.test(q)) {
      intent.brand = brand;
      break;
    }
  }

  // Detect category
  if (/objectif|lens|عدسة|عدسات|optique/i.test(q)) intent.category = 'lenses';
  else if (/filtre|filter|فلتر|nd|vnd|cpl/i.test(q)) intent.category = 'filters';
  else if (/eclairage|lighting|light|إضاءة|softbox/i.test(q)) intent.category = 'lighting';
  else if (/camera|caméra|appareil|كاميرا/i.test(q)) intent.category = 'cameras';

  // Detect mount
  if (/sony e|e-mount|e mount/i.test(q)) intent.mount = 'Sony E';
  else if (/canon rf|eos-r|rf mount/i.test(q)) intent.mount = 'Canon RF';
  else if (/nikon z|z-mount|z mount/i.test(q)) intent.mount = 'Nikon Z';
  else if (/fuji|x-mount|fx mount/i.test(q)) intent.mount = 'Fujifilm X';
  else if (/l-mount|l mount/i.test(q)) intent.mount = 'L-Mount';

  // Detect use case
  if (/cinéma|cinema|film|سينما/i.test(q)) intent.useCase = 'filmmakers';
  else if (/vidéo|video|فيديو/i.test(q)) intent.useCase = 'videographers';
  else if (/photo|portrait|صور/i.test(q)) intent.useCase = 'photographers';
  else if (/vlog|youtube|content|محتوى/i.test(q)) intent.useCase = 'content-creators';
  else if (/interview|مقابل/i.test(q)) intent.useCase = 'interviews';
  else if (/mariage|wedding|زفاف/i.test(q)) intent.useCase = 'weddings';

  return intent;
}

export function getProductPriorityScore(p: Product): number {
  const attr = extractProductAttributes(p);
  const nameL = (p.name || '').toLowerCase();
  const catL = (p.category || '').toLowerCase();

  // Flagship Cameras & Video Boîtiers (Top Priority)
  if (attr.product_type === 'camera' || catL.includes('appareil photo') || catL.includes('caméra') || catL.includes('camera') || nameL.startsWith('nikon z') || nameL.startsWith('nikon zr') || nameL.startsWith('sony alpha') || nameL.startsWith('canon eos')) {
    if (nameL.includes('alpha 7') || nameL.includes('fx3') || nameL.includes('r5') || nameL.includes('r6') || nameL.includes('zr') || nameL.includes('z6') || nameL.includes('z9') || nameL.includes('pocket 3')) {
      return 100; // Top flagship cameras
    }
    return 90; // Other cameras
  }

  // Premium & Cinema Lenses (Sony GM, Canon RF L, Nikkor S, 7Artisans Cine)
  if (attr.product_type === 'lens') {
    if (attr.lens_type === 'cinema' || nameL.includes('gm') || nameL.includes(' f/1.2') || nameL.includes(' f/1.4') || nameL.includes(' f/2.8')) {
      return 80;
    }
    return 70;
  }

  // Pro Studio Lighting & Flashes (Godox)
  if (attr.product_type === 'light' || catL.includes('flash') || catL.includes('studio') || catL.includes('éclairage')) {
    return 65;
  }

  // Stabilizers & Heavy Duty Tripods (DJI, Vanguard)
  if (catL.includes('stabilisateur') || catL.includes('trépied') || nameL.includes('osmo') || nameL.includes('veo') || nameL.includes('alta')) {
    return 60;
  }

  // Wireless Audio & Intercoms (Hollyland, Røde)
  if (attr.product_type === 'audio' || nameL.includes('lark') || nameL.includes('solidcom')) {
    return 55;
  }

  // Cages & Cinema Rigging (SmallRig)
  if (catL.includes('cage') || nameL.includes('smallrig') || nameL.includes('matte box')) {
    return 50;
  }

  // Storage & Filters (K&F Concept, PNY, Sony CFexpress)
  if (attr.product_type === 'filter' || catL.includes('carte') || catL.includes('batterie')) {
    return 40;
  }

  return 30; // Accessories & others
}

/**
 * Finds all genuine compatible lenses in the catalog for a given camera product.
 * Matches by camera mount / brand (e.g. Nikon Z -> Nikkor Z; Sony E -> Sony FE/E; Canon RF -> Canon RF).
 */
export function findCompatibleLensesForCamera(products: Product[], cameraProduct: Product): Product[] {
  if (!cameraProduct || !Array.isArray(products) || products.length === 0) return [];
  const cameraAttrs = extractProductAttributes(cameraProduct);
  const camNameLower = (cameraProduct.name || '').toLowerCase();
  const camBrandLower = (cameraAttrs.brand || '').toLowerCase();

  const isCamera =
    cameraAttrs.product_type === 'camera' ||
    (cameraProduct.category || '').toLowerCase().includes('appareil') ||
    (cameraProduct.category || '').toLowerCase().includes('caméra') ||
    (cameraProduct.category || '').toLowerCase().includes('camera') ||
    camNameLower.includes('nikon z') ||
    camNameLower.includes('sony alpha') ||
    camNameLower.includes('canon eos') ||
    camNameLower.includes('fx3') ||
    camNameLower.includes('fx30');

  if (!isCamera) return [];

  return products
    .filter((p) => {
      if (p.id === cameraProduct.id) return false;
      const attr = extractProductAttributes(p);
      const pNameLower = (p.name || '').toLowerCase();
      const isLens =
        attr.product_type === 'lens' ||
        (p.category || '').toLowerCase().includes('objectif') ||
        pNameLower.includes('nikkor') ||
        pNameLower.includes('fe ') ||
        pNameLower.includes('rf ') ||
        pNameLower.includes('lens');
      if (!isLens) return false;

      // Nikon Z cameras
      if (camBrandLower === 'nikon' || camNameLower.includes('nikon') || cameraAttrs.mount === 'Nikon Z') {
        return (
          attr.mount === 'Nikon Z' ||
          pNameLower.includes('nikkor z') ||
          (pNameLower.includes('nikon') && pNameLower.includes('50mm')) ||
          (pNameLower.includes('nikon') && pNameLower.includes('24-70mm')) ||
          (pNameLower.includes('nikon') && pNameLower.includes('70-200mm'))
        );
      }

      // Sony E cameras
      if (camBrandLower === 'sony' || camNameLower.includes('sony') || cameraAttrs.mount === 'Sony E') {
        return (
          attr.mount === 'Sony E' ||
          pNameLower.includes('fe ') ||
          pNameLower.includes('sony e') ||
          (pNameLower.includes('sony') && (pNameLower.includes('gm') || pNameLower.includes('f/')))
        );
      }

      // Canon RF cameras
      if (camBrandLower === 'canon' || camNameLower.includes('canon') || cameraAttrs.mount.includes('Canon')) {
        return (
          attr.mount.includes('Canon') ||
          pNameLower.includes('canon rf') ||
          pNameLower.includes('rf ') ||
          pNameLower.includes('ef-s')
        );
      }

      // Fujifilm X cameras
      if (camBrandLower.includes('fuji') || cameraAttrs.mount === 'Fuji FX') {
        return attr.mount === 'Fuji FX' || pNameLower.includes('fuji');
      }

      // Match by exact mount
      if (cameraAttrs.mount && cameraAttrs.mount !== 'Universel' && attr.mount === cameraAttrs.mount) {
        return true;
      }

      return false;
    })
    .sort((a, b) => (b.price || 0) - (a.price || 0));
}

