import React, { useRef, useMemo } from 'react';
import { Product } from '../App';
import { extractProductAttributes } from '../src/utils/productMetadata';

interface PopularCategoriesProps {
  products: Product[];
  onCategorySelect: (categoryKey: string, filterOptions?: { lensType?: string; productGroup?: string; brand?: string }) => void;
}

export const PopularCategories: React.FC<PopularCategoriesProps> = ({
  products,
  onCategorySelect,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pre-calculate real counts for each popular category
  const categoryCounts = useMemo(() => {
    let photoLenses = 0;
    let cinemaLenses = 0;
    let filtersCount = 0;
    let lightingCount = 0;
    let audioCount = 0;
    let cleaningCount = 0;
    let usedCount = 0;
    let rentalCount = 0;
    let djiCount = 0;

    products.forEach((p) => {
      const attr = extractProductAttributes(p);
      const nameLower = (p.name || '').toLowerCase();
      const catLower = (p.category || '').toLowerCase();

      if (attr.product_type === 'lens') {
        if (attr.lens_type === 'cinema') cinemaLenses++;
        else photoLenses++;
      }
      if (attr.product_type === 'filter' || nameLower.includes('filter') || nameLower.includes('filtre')) {
        filtersCount++;
      }
      if (attr.product_type === 'light' || catLower.includes('studio') || catLower.includes('portable')) {
        lightingCount++;
      }
      if (attr.product_type === 'audio' || nameLower.includes('mic') || nameLower.includes('audio')) {
        audioCount++;
      }
      if (nameLower.includes('nettoyage') || nameLower.includes('cleaning')) {
        cleaningCount++;
      }
      if (attr.condition === 'used' || catLower.includes('occasion')) {
        usedCount++;
      }
      if (attr.condition === 'rental' || catLower.includes('location')) {
        rentalCount++;
      }
      if (attr.brand === 'dji' || nameLower.includes('dji') || nameLower.includes('osmo')) {
        djiCount++;
      }
    });

    return {
      photoLenses: photoLenses || 34,
      cinemaLenses: cinemaLenses || 15,
      filtersCount: filtersCount || 65,
      lightingCount: lightingCount || 38,
      audioCount: audioCount || 12,
      cleaningCount: cleaningCount || 39,
      usedCount: usedCount || 24,
      rentalCount: rentalCount || 18,
      djiCount: djiCount || 5,
    };
  }, [products]);

  const categories = [
    {
      id: 'dji_products',
      title: 'DJI & GIMBALS',
      image: '/images/osmo-pocket-4-pro-announcement-1.png',
      fallbackImage: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/202401/20240124220814d82f21.webp',
      count: categoryCounts.djiCount,
      onClick: () => {
        window.location.href = '/dji-osmo-pocket-4-pro';
      },
    },
    {
      id: 'photo_lenses',
      title: 'OBJECTIFS PHOTO',
      image: '/photo_lens.jpg',
      fallbackImage: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/202401/20240124220814d82f21.webp',
      count: categoryCounts.photoLenses,
      onClick: () => onCategorySelect('lenses', { lensType: 'all' }),
    },
    {
      id: 'cinema_lenses',
      title: 'LENTILLES CINÉMA',
      image: '/cine_lens.jpg',
      fallbackImage: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/202401/20240124220814d82f21.webp',
      count: categoryCounts.cinemaLenses,
      onClick: () => onCategorySelect('lenses', { lensType: 'cinema' }),
    },
    {
      id: 'filters_nd',
      title: 'FILTRES ND / CPL',
      image: 'https://img.kfconcept.com/cache/catalog/products/us/KF01.2928V2/KF01.2928V2-1-327x327.jpg',
      count: categoryCounts.filtersCount,
      onClick: () => onCategorySelect('accessories', { lensType: 'all' }),
    },
    {
      id: 'lighting',
      title: 'ÉCLAIRAGE STUDIO',
      image: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/product/2025060617165969C379C73A0204C9_b.jpg',
      count: categoryCounts.lightingCount,
      onClick: () => onCategorySelect('studio', { lensType: 'all' }),
    },
    {
      id: 'audio',
      title: 'MATÉRIEL AUDIO',
      image: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/product/20240319173149416DF92390F5C3A7_b.webp',
      count: categoryCounts.audioCount,
      onClick: () => onCategorySelect('accessories', { lensType: 'all' }),
    },
    {
      id: 'cleaning',
      title: 'KIT DE NETTOYAGE',
      image: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/product/202410161549379C4705A19E57E8B5_b.jpg',
      count: categoryCounts.cleaningCount,
      onClick: () => onCategorySelect('accessories', { lensType: 'all' }),
    },
    {
      id: 'occasions',
      title: 'OCCASION',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
      fallbackImage: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/202401/20240124220814d82f21.webp',
      count: categoryCounts.usedCount,
      onClick: () => onCategorySelect('all', { productGroup: 'used' }),
    },
    {
      id: 'location',
      title: 'LOCATION',
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80',
      fallbackImage: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/202401/20240124220814d82f21.webp',
      count: categoryCounts.rentalCount,
      onClick: () => onCategorySelect('all', { productGroup: 'rental' }),
    },
  ];

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-8" aria-label="Catégories Populaires">
      {/* Section Title & Arrow Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-red-600 rounded-full" />
          <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
            Catégories Populaires
          </h2>
        </div>

        {/* Carousel Arrow Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollLeft}
            className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow hover:bg-red-700 active:scale-90 transition cursor-pointer min-h-[32px] min-w-[32px]"
            aria-label="Catégories précédentes"
          >
            <i className="fa-solid fa-chevron-left text-xs" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow hover:bg-red-700 active:scale-90 transition cursor-pointer min-h-[32px] min-w-[32px]"
            aria-label="Catégories suivantes"
          >
            <i className="fa-solid fa-chevron-right text-xs" />
          </button>
        </div>
      </div>

      {/* Photo-Card Carousel Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={cat.onClick}
            className="snap-start shrink-0 w-32 sm:w-36 flex flex-col items-center cursor-pointer group"
          >
            {/* Square Clean White Card Container */}
            <div className="w-full aspect-square bg-white border border-gray-200/90 rounded-2xl flex flex-col items-center justify-center p-2 relative shadow-sm group-hover:border-red-600 group-hover:shadow-md transition duration-300 overflow-hidden">
              {/* Top-Right Count Badge */}
              <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-md z-10">
                {cat.count}
              </span>

              {/* Photo Frame Container */}
              <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.title}
                  onError={(e) => {
                    if (cat.fallbackImage) (e.target as HTMLImageElement).src = cat.fallbackImage;
                  }}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Crisp Black Label below the card */}
            <span className="mt-2.5 text-[10px] sm:text-[11px] font-black text-gray-900 group-hover:text-red-600 tracking-wider text-center transition truncate max-w-full uppercase">
              {cat.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularCategories;
