import React, { useMemo } from 'react';
import { Product } from '../App';

interface ShopCategoriesProps {
  products: Product[];
  onCategorySelect: (category: string) => void;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'lenses': 'Objectifs Photo & Ciné',
  'cameras': 'Caméras & Boîtiers',
  'studio': 'Éclairage Studio',
  'portable': 'Éclairage Portable',
  'accessories': 'Accessoires & Filtres',
  'Objectifs': 'Objectifs Photo & Ciné',
  'Caméras & Boîtiers': 'Caméras & Boîtiers',
  'Éclairage & Studio': 'Éclairage Studio',
  'Stabilisateurs & Gimbals': 'Stabilisateurs & Gimbals',
  'Occasions / Seconde Main': 'Occasions Certifiées',
  'Location de Matériel': 'Location de Matériel',
  'Accessoires & Produits Divers': 'Accessoires & Filtres',
};

const CATEGORY_ICONS: Record<string, string> = {
  'lenses': 'fa-circle-dot',
  'cameras': 'fa-camera',
  'studio': 'fa-lightbulb',
  'portable': 'fa-battery-three-quarters',
  'accessories': 'fa-box-open',
  'Objectifs': 'fa-circle-dot',
  'Caméras & Boîtiers': 'fa-camera',
  'Éclairage & Studio': 'fa-lightbulb',
  'Stabilisateurs & Gimbals': 'fa-arrows-rotate',
  'Occasions / Seconde Main': 'fa-recycle',
  'Location de Matériel': 'fa-film',
  'Accessoires & Produits Divers': 'fa-box-open',
};

const ShopCategories: React.FC<ShopCategoriesProps> = ({ products, onCategorySelect }) => {
  const categoryData = useMemo(() => {
    const counts: Record<string, { count: number; image: string | null }> = {};
    products.forEach(p => {
      if (!p.category || p.category === 'all') return;
      if (!counts[p.category]) {
        counts[p.category] = { count: 0, image: null };
      }
      counts[p.category].count += 1;
      if (!counts[p.category].image && p.image && p.image.startsWith('http')) {
        counts[p.category].image = p.image;
      }
    });

    return Object.entries(counts)
      .map(([rawCat, data]) => ({
        rawCategory: rawCat,
        displayName: CATEGORY_DISPLAY_NAMES[rawCat] || rawCat,
        icon: CATEGORY_ICONS[rawCat] || 'fa-tag',
        count: data.count,
        image: data.image,
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  if (categoryData.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4 md:px-6">

        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600 mb-1">
              RAYONS &amp; CATÉGORIES PRINCIPALES
            </p>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              Explorer par Gamme de Matériel
            </h2>
          </div>
          <a
            href="#products"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
          >
            Tout le catalogue
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </a>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
          {categoryData.map(({ rawCategory, displayName, icon, count, image }) => (
            <button
              key={rawCategory}
              onClick={() => onCategorySelect(rawCategory)}
              className="group flex flex-col bg-white border border-gray-200/90 rounded-2xl overflow-hidden hover:border-red-500 hover:shadow-lg transition-all duration-300 text-left cursor-pointer"
            >
              {/* Product preview image */}
              <div className="w-full h-28 bg-gray-50 flex items-center justify-center p-3 overflow-hidden relative border-b border-gray-100 group-hover:bg-red-50/20 transition-colors">
                {image ? (
                  <img
                    src={image}
                    alt={displayName}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-200/80 flex items-center justify-center">
                    <i className={`fa-solid ${icon} text-xl text-gray-600`} />
                  </div>
                )}
              </div>

              {/* Title and Count */}
              <div className="p-3 bg-white flex flex-col justify-between flex-1">
                <p className="text-xs font-black text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                  {displayName}
                </p>
                <p className="text-[10px] text-gray-500 font-bold mt-1">
                  {count} article{count > 1 ? 's' : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopCategories;
