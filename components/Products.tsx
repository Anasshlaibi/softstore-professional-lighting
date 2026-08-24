import React, { useState, useMemo } from 'react';
import { Product } from '../App';
import ProductCard from './ProductCard';
import ProductFilters, { FilterState } from './ProductFilters';
import CatalogSidebar from './CatalogSidebar';
import FilterDrawer from './FilterDrawer';
import { PopularCategories } from './PopularCategories';
import { extractProductAttributes } from '../src/utils/productMetadata';
import { useCart } from '../src/context/CartContext';
import richDescriptions from '../src/data/richDescriptions.json';

interface ProductsProps {
  products: Product[];
  onProductClick: (id: number) => void;
  siteConfig: { currency: string; phone: string };
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  initialCategory?: string;
  onCategoryConsumed?: () => void;
  initialBrand?: string;
  onBrandConsumed?: () => void;
}

const Products: React.FC<ProductsProps> = ({
  products,
  onProductClick,
  siteConfig,
  globalSearchQuery,
  setGlobalSearchQuery,
  initialCategory,
  onCategoryConsumed,
  initialBrand,
  onBrandConsumed,
}) => {
  const { addToCart } = useCart();

  const maxPrice = useMemo(
    () => Math.max(...products.map((p) => p.price), 10000),
    [products]
  );

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    mount: 'all',
    brand: 'all',
    lensType: 'all',
    filterDiameter: undefined,
    priceRange: [0, maxPrice],
    inStockOnly: false,
    sortBy: 'default',
  });

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  React.useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      setFilters((prev) => ({ ...prev, category: initialCategory }));
      onCategoryConsumed?.();
    }
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialBrand && initialBrand !== 'all') {
      setFilters((prev) => ({ ...prev, brand: initialBrand }));
      onBrandConsumed?.();
    }
  }, [initialBrand]);

  const [displayLimit, setDisplayLimit] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    cats.add('DJI & Gimbals');
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (globalSearchQuery.trim()) {
      const searchTerms = globalSearchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      filtered = filtered.filter((p) => {
        const richDesc = (richDescriptions as Record<string, string>)[p.id?.toString()] || '';
        const meta = extractProductAttributes(p);
        const searchText = `${p.name} ${p.category} ${meta.mount} ${meta.brand} ${meta.lens_type || ''} ${p.desc} ${richDesc}`.toLowerCase();
        return searchTerms.every((term) => searchText.includes(term));
      });
    }

    if (filters.category !== 'all') {
      const catLower = filters.category.toLowerCase();
      filtered = filtered.filter((p) => {
        const pCatLower = (p.category || '').toLowerCase();
        if (pCatLower === catLower) return true;
        if (catLower.includes('objectif') || catLower === 'lenses') {
          return pCatLower.includes('lens') || pCatLower.includes('objectif');
        }
        if (catLower.includes('accessoire') || catLower === 'accessories') {
          return pCatLower.includes('accessor') || pCatLower.includes('accessoire');
        }
        if (catLower.includes('éclairage') || catLower.includes('eclairage') || catLower === 'studio' || catLower === 'portable') {
          return pCatLower.includes('studio') || pCatLower.includes('portable') || pCatLower.includes('éclairage') || pCatLower.includes('eclairage');
        }
        if (catLower.includes('caméra') || catLower.includes('camera')) {
          return pCatLower.includes('camera') || pCatLower.includes('caméra');
        }
        if (catLower.includes('dji')) {
          const attr = extractProductAttributes(p);
          return attr.brand.toLowerCase() === 'dji' || p.name.toLowerCase().includes('dji') || p.name.toLowerCase().includes('osmo');
        }
        return false;
      });
    }

    if (filters.lensType && filters.lensType !== 'all') {
      filtered = filtered.filter((p) => {
        const attr = extractProductAttributes(p);
        if (attr.product_type !== 'lens') return false;
        return attr.lens_type === filters.lensType;
      });
    }

    if (filters.filterDiameter) {
      filtered = filtered.filter((p) => {
        const attr = extractProductAttributes(p);
        return attr.filter_diameter ? `${attr.filter_diameter}mm` === filters.filterDiameter : false;
      });
    }

    if (filters.mount !== 'all') {
      filtered = filtered.filter((p) => {
        const attr = extractProductAttributes(p);
        return attr.mount === filters.mount;
      });
    }

    if (filters.brand !== 'all') {
      filtered = filtered.filter((p) => {
        const attr = extractProductAttributes(p);
        return attr.brand.toLowerCase() === filters.brand.toLowerCase();
      });
    }

    if (filters.productGroup) {
      filtered = filtered.filter((p) => {
        const attr = extractProductAttributes(p);
        return attr.condition === filters.productGroup;
      });
    }

    if (filters.inStockOnly) {
      filtered = filtered.filter((p) => p.inStock);
    }

    filtered = filtered.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Mix of different categories for the default "En Vedette" sort to show catalog variety
    const invoiceIds = [3001, 1027, 4, 2001, 1002, 2009, 3, 1004, 2008, 1035, 1060, 1021, 8, 2006, 1019, 1018, 1030, 1015, 1023, 1043, 1061, 1062];
    const sorted = [...filtered].sort((a, b) => {
      const aIndex = invoiceIds.indexOf(a.id || 0);
      const bIndex = invoiceIds.indexOf(b.id || 0);
      const isANew = aIndex !== -1;
      const isBNew = bIndex !== -1;

      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return (b.id || 0) - (a.id || 0);
        case 'default':
        default:
          if (isANew && !isBNew) return -1;
          if (!isANew && isBNew) return 1;
          if (isANew && isBNew) return aIndex - bIndex;
          return (a.id || 0) - (b.id || 0);
      }
    });

    return sorted.sort((a, b) => (a.inStock === b.inStock ? 0 : a.inStock ? -1 : 1));
  }, [products, globalSearchQuery, filters]);

  React.useEffect(() => {
    setDisplayLimit(12);
  }, [filters, globalSearchQuery]);

  const openWhatsappReserve = (productName: string) => {
    const phone = siteConfig.phone.replace('+212', '212');
    const msg = `Bonjour, je souhaite réserver le produit hors stock : ${productName}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const generateStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fa-solid fa-star text-[10px] ${
          i < rating ? 'text-[#ff3b30]' : 'text-gray-200'
        }`}
      ></i>
    ));
  };

  const activeFilterCount = [
    filters.category !== 'all',
    filters.mount !== 'all',
    filters.brand !== 'all',
    filters.lensType && filters.lensType !== 'all',
    filters.productGroup !== undefined,
    filters.inStockOnly,
    filters.filterDiameter !== undefined,
  ].filter(Boolean).length;

  return (
    <section id="products" className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-red-600 rounded-full shrink-0" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-red-600 mb-0.5">
                BOUTIQUE AUDIOVISUELLE PRO
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">
                Catalogue Équipements Pro &amp; Occasions
              </h2>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-3 md:mt-0 font-medium hidden md:block">
            Revendeur officiel au Maroc • Matériel neuf garanti &amp; Occasions vérifiées
          </p>
        </div>

        {/* Catégories Populaires Icon-Card Carousel */}
        <PopularCategories
          products={products}
          onCategorySelect={(cat, opts) => {
            setFilters(prev => ({
              ...prev,
              category: cat,
              lensType: opts?.lensType || 'all',
              productGroup: opts?.productGroup,
              brand: opts?.brand || prev.brand
            }));
            window.location.hash = '#products';
          }}
        />

        {/* Visible Quick Filter Pills Bar - Wrapped Multi-row for Phone & PC */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {[
            {
              id: 'all',
              label: 'Tous',
              isActive: filters.category === 'all' && !filters.productGroup && (filters.lensType === 'all' || !filters.lensType),
              onClick: () => setFilters({ ...filters, category: 'all', productGroup: undefined, lensType: 'all' }),
            },
            {
              id: 'lenses',
              label: 'Objectifs Photo',
              isActive: (filters.category.toLowerCase().includes('objectif') || filters.category === 'lenses') && (filters.lensType === 'all' || !filters.lensType),
              onClick: () => setFilters({ ...filters, category: 'lenses', productGroup: undefined, lensType: 'all' }),
            },
            {
              id: 'cinema',
              label: 'Lentilles Cinéma',
              isActive: filters.lensType === 'cinema',
              onClick: () => setFilters({ ...filters, category: 'lenses', lensType: 'cinema', productGroup: undefined }),
            },
            {
              id: 'accessories',
              label: 'Accessoires & Filtres',
              isActive: filters.category.toLowerCase().includes('accessoir') || filters.category === 'accessories',
              onClick: () => setFilters({ ...filters, category: 'accessories', productGroup: undefined, lensType: 'all' }),
            },
            {
              id: 'lighting',
              label: 'Éclairage Studio',
              isActive: filters.category.toLowerCase().includes('éclairage') || filters.category === 'studio' || filters.category === 'portable',
              onClick: () => setFilters({ ...filters, category: 'studio', productGroup: undefined, lensType: 'all' }),
            },
            {
              id: 'occasions',
              label: 'Occasions Certifiées',
              isActive: filters.productGroup === 'used',
              onClick: () => setFilters({ ...filters, category: 'all', productGroup: 'used', lensType: 'all' }),
            },
            {
              id: 'location',
              label: 'Location Matériel',
              isActive: filters.productGroup === 'rental',
              onClick: () => setFilters({ ...filters, category: 'all', productGroup: 'rental', lensType: 'all' }),
            },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={pill.onClick}
              className={`px-4 py-2 rounded-full text-xs font-extrabold border transition cursor-pointer min-h-[40px] ${
                pill.isActive
                  ? 'bg-red-600 text-white border-red-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-red-500 hover:text-red-600 shadow-sm'
              }`}
            >
              {pill.label}
            </button>
          ))}

          {/* Advanced Filter Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="px-4 py-2 rounded-full text-xs font-extrabold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 transition cursor-pointer min-h-[40px] flex items-center gap-1.5 shadow-sm"
          >
            <i className="fa-solid fa-sliders text-xs text-red-600" />
            <span>Filtres Avancés</span>
            {activeFilterCount > 0 && (
              <span className="bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Main Section Controls Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/80 shadow-sm">
          {/* Results Count & Active Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-700 w-full sm:w-auto">
            <span className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200 text-[11px] font-extrabold">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
            </span>

            {filters.category !== 'all' && (
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1.5 text-[11px]">
                <i className="fa-solid fa-tag text-[9px] text-gray-500" />
                {filters.category}
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, category: 'all' })}
                  className="ml-1 text-gray-400 hover:text-red-600 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {filters.lensType && filters.lensType !== 'all' && (
              <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-200 flex items-center gap-1.5 text-[11px]">
                {filters.lensType}
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, lensType: 'all' })}
                  className="ml-1 text-red-400 hover:text-red-600 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          {/* Sort & Grid Mode Toggle */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-200 text-gray-900 rounded-xl text-xs font-bold focus:outline-none min-h-[44px]"
            >
              <option value="default">En Vedette</option>
              <option value="newest">Nouveautés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>

            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 font-bold shadow'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
                aria-label="Mode Grille"
              >
                <i className="fa-solid fa-grip-vertical" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 font-bold shadow'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
                aria-label="Mode Liste"
              >
                <i className="fa-solid fa-list" />
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Desktop Layout: Desktop Sidebar Left, Catalog Grid Right */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Left Sidebar Filters (Visible on Desktop LG) */}
          <div className="hidden lg:block w-72 shrink-0">
            <CatalogSidebar
              filters={filters}
              onFilterChange={(newFilters) => {
                setFilters(newFilters as FilterState);
              }}
              products={products}
              filteredProducts={filteredProducts}
              categories={categories}
            />
          </div>

          {/* Main Catalog Grid */}
          <div className="flex-1 w-full space-y-6">
            {filteredProducts.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6'
                      : 'flex flex-col gap-4'
                  }
                >
                  {filteredProducts.slice(0, displayLimit).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onProductClick={onProductClick}
                      siteConfig={siteConfig}
                      openWhatsappReserve={openWhatsappReserve}
                      generateStars={generateStars}
                      addToCart={addToCart}
                    />
                  ))}
                </div>

                {displayLimit < filteredProducts.length && (
                  <div className="flex justify-center pt-8 pb-4">
                    <button
                      type="button"
                      onClick={() => setDisplayLimit((prev) => prev + 12)}
                      className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black tracking-widest uppercase rounded-2xl transition-all shadow-lg hover:shadow-red-600/30 cursor-pointer min-h-[48px]"
                    >
                      Charger Plus de Produits ({filteredProducts.length - displayLimit} restants)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-sm">
                <div className="text-red-600 mb-4">
                  <i className="fa-solid fa-search text-5xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Aucun matériel ne correspond à ces critères
                </h3>
                <p className="text-xs text-gray-500 mb-6 max-w-md mx-auto">
                  Essayez de réinitialiser la monture ou la marque pour afficher l'ensemble des équipements disponibles.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setGlobalSearchQuery('');
                    setFilters({
                      category: 'all',
                      mount: 'all',
                      brand: 'all',
                      priceRange: [0, maxPrice],
                      inStockOnly: false,
                      sortBy: 'default',
                    });
                  }}
                  className="px-6 py-3 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition cursor-pointer min-h-[44px]"
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Off-Canvas Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        products={products}
        filteredCount={filteredProducts.length}
        categories={categories}
      />
    </section>
  );
};

export default Products;
