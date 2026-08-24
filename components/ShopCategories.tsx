import React, { useMemo } from 'react';
import { Product } from '../App';

interface ShopCategoriesProps {
  products: Product[];
  onCategorySelect: (category: string) => void;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'lenses': 'cameras',
  'cameras': 'cameras',
  'studio': 'eclairage',
  'portable': 'objectifs',
  'accessories': 'accessoires',
  'Objectifs': 'objectifs',
  'Caméras & Boîtiers': 'cameras',
  'Éclairage & Studio': 'eclairage',
  'Stabilisateurs & Gimbals': 'stabilisateurs',
  'Occasions / Seconde Main': 'occasions',
  'Location de Matériel': 'location',
  'Accessoires & Produits Divers': 'accessoires',
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
    products.forEach((p) => {
      if (!p.category || p.category === 'all') return;
      if (!counts[p.category]) {
        counts[p.category] = { count: 0, image: null };
      }
      counts[p.category].count += 1;
      if (!counts[p.category].image && p.image && (p.image.startsWith('http') || p.image.startsWith('/'))) {
        counts[p.category].image = p.image;
      }
    });

    return Object.entries(counts)
      .map(([rawCat, data]) => ({
        rawCategory: rawCat,
        displayName: CATEGORY_DISPLAY_NAMES[rawCat] || rawCat.toLowerCase(),
        icon: CATEGORY_ICONS[rawCat] || 'fa-tag',
        count: data.count,
        image: data.image,
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  if (categoryData.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800" aria-label="Catégories principales">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-red-600 rounded-full" />
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Catégories &amp; Rayons
            </h2>
          </div>
          <span className="text-[11px] font-bold text-gray-400 md:hidden">
            Faire défiler ➔
          </span>
        </div>

        {/* Responsive Container: Horizontal swipe on phone (<768px), Grid on PC (>=768px) */}
        <div className="flex md:grid md:grid-cols-4 lg:grid-cols-7 items-center gap-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-smooth no-scrollbar pb-3 md:pb-0 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categoryData.map(({ rawCategory, displayName, icon, count, image }) => (
            <button
              key={rawCategory}
              type="button"
              onClick={() => onCategorySelect(rawCategory)}
              className="snap-start shrink-0 w-32 sm:w-40 md:w-auto aspect-square bg-white dark:bg-gray-800 border border-gray-200/90 dark:border-gray-700/80 rounded-2xl p-3 flex flex-col items-center justify-between shadow-sm hover:border-red-600 dark:hover:border-red-600 hover:shadow-md active:scale-95 transition-all cursor-pointer group min-h-[44px] min-w-[44px]"
            >
              {/* Centered Image/Icon */}
              <div className="w-full flex-1 flex items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 group-hover:bg-red-50/40 dark:group-hover:bg-red-950/20 transition overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={displayName}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-300"
                    loading="lazy"
                  />
                ) : (
                  <i className={`fa-solid ${icon} text-2xl text-gray-500 group-hover:text-red-600`} />
                )}
              </div>

              {/* Title & Subtitle Count */}
              <div className="text-center mt-2 w-full">
                <span className="block text-xs font-black text-gray-900 dark:text-white group-hover:text-red-600 transition truncate capitalize">
                  {displayName}
                </span>
                <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500">
                  {count} produit{count > 1 ? 's' : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopCategories;
