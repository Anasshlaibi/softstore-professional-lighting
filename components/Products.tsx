import React, { useState, useMemo } from 'react';
import { Product } from '../App';
import ProductCard from './ProductCard';
import ProductFilters, { FilterState } from './ProductFilters';
import CatalogSidebar from './CatalogSidebar';
import { extractProductAttributes } from '../src/utils/productMetadata';
import { useCart } from '../src/context/CartContext';
import richDescriptions from '../src/data/richDescriptions.json';

interface ProductsProps {
  products: Product[];
  onProductClick: (id: number) => void;
  siteConfig: { currency: string; phone: string };
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  initialCategory?: string;        // pre-selected from ShopCategories click
  onCategoryConsumed?: () => void; // called after category is applied
  initialBrand?: string;           // pre-selected from BrandLogos click
  onBrandConsumed?: () => void;    // called after brand is applied
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

  // Calculate max price from products
  const maxPrice = useMemo(() =>
    Math.max(...products.map(p => p.price), 10000),
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
    sortBy: 'default'
  });

  // When a category card is clicked from ShopCategories, pre-apply the filter
  React.useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      setFilters(prev => ({ ...prev, category: initialCategory }));
      onCategoryConsumed?.();
    }
  }, [initialCategory]);

  // When a brand is clicked from BrandLogos, pre-apply the filter
  React.useEffect(() => {
    if (initialBrand && initialBrand !== 'all') {
      setFilters(prev => ({ ...prev, brand: initialBrand }));
      onBrandConsumed?.();
    }
  }, [initialBrand]);

  const [displayLimit, setDisplayLimit] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...Array.from(new Set(products.map(p => p.category)))];
    return cats;
  }, [products]);

  // Filter and sort products with robust multi-field metadata matching
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // ── Global search ─────────────────────────────────────────────────────────
    if (globalSearchQuery.trim()) {
      const searchTerms = globalSearchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      filtered = filtered.filter(p => {
        const richDesc = (richDescriptions as Record<string, string>)[p.id?.toString()] || '';
        const meta = extractProductAttributes(p);
        const searchText = `${p.name} ${p.category} ${meta.mount} ${meta.brand} ${meta.lens_type || ''} ${p.desc} ${richDesc}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      });
    }

    // ── Category filter ───────────────────────────────────────────────────────
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // ── Lens Type filter (Cinema / Autofocus / Manuel) - STRICT LENS CHECK ──────
    if (filters.lensType && filters.lensType !== 'all') {
      filtered = filtered.filter(p => {
        const attr = extractProductAttributes(p);
        // Non-lenses must NEVER match a lens type
        if (attr.product_type !== 'lens') return false;
        return attr.lens_type === filters.lensType;
      });
    }

    // ── Filter Diameter filter (e.g. 77mm, 55mm) ──────────────────────────────
    if (filters.filterDiameter) {
      filtered = filtered.filter(p => {
        const attr = extractProductAttributes(p);
        return attr.filter_diameter ? `${attr.filter_diameter}mm` === filters.filterDiameter : false;
      });
    }

    // ── Camera Mount / System filter ──────────────────────────────────────────
    if (filters.mount !== 'all') {
      filtered = filtered.filter(p => {
        const attr = extractProductAttributes(p);
        return attr.mount === filters.mount;
      });
    }

    // ── Brand filter ──────────────────────────────────────────────────────────
    if (filters.brand !== 'all') {
      filtered = filtered.filter(p => {
        const attr = extractProductAttributes(p);
        return attr.brand.toLowerCase() === filters.brand.toLowerCase();
      });
    }

    // ── Product Group / Condition filter ──────────────────────────────────────
    if (filters.productGroup) {
      filtered = filtered.filter(p => {
        const attr = extractProductAttributes(p);
        return attr.condition === filters.productGroup;
      });
    }

    // ── Stock filter ──────────────────────────────────────────────────────────
    if (filters.inStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }

    // ── Price range filter ────────────────────────────────────────────────────
    filtered = filtered.filter(
      p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // ── Sorting ───────────────────────────────────────────────────────────────
    const invoiceIds = [1027, 1002, 1004, 1035, 1021, 1019, 1018, 1030, 1015, 1023, 1043, 1060, 1061, 1062];
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

    // Keep in-stock items first
    return sorted.sort((a, b) =>
      a.inStock === b.inStock ? 0 : a.inStock ? -1 : 1
    );
  }, [products, globalSearchQuery, filters]);

  // Reset displayLimit whenever filters change so user sees fresh results
  React.useEffect(() => {
    setDisplayLimit(12);
  }, [filters, globalSearchQuery]);

  const openWhatsappReserve = (productName: string) => {
    const phone = siteConfig.phone.replace('+212', '212');
    const msg = `Bonjour, je souhaite réserver le produit hors stock : ${productName}`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  const generateStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fa-solid fa-star text-[10px] ${i < rating ? 'text-[#ff3b30]' : 'text-gray-200'
          }`}
      ></i>
    ));
  };

  return (
    <section id="products" className="py-10 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-red-600 rounded-full shrink-0" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-red-500 mb-0.5">
                Boutique Audiovisuelle Pro
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


        {/* 2-Column Layout: Sidebar Left, Catalog Grid Right */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar Filters */}
          <CatalogSidebar
            filters={filters}
            onFilterChange={(newFilters) => {
              setFilters(newFilters as FilterState);
            }}
            products={products}
            filteredProducts={filteredProducts}
            categories={categories}
          />

          {/* Right Main Catalog Grid */}
          <div className="flex-1 w-full space-y-6">
            {/* Horizontal Filter Bar & Controls */}
            <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs font-bold text-gray-700">
                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 font-extrabold">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
                </span>
                {/* Active filter pills */}
                {filters.category !== 'all' && (
                  <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
                    <i className="fa-solid fa-tag text-[9px] text-gray-500"></i>
                    {filters.category}
                    <button onClick={() => setFilters({ ...filters, category: 'all' })} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                  </span>
                )}
                {filters.lensType && filters.lensType !== 'all' && (
                  <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
                    <i className="fa-solid fa-circle-dot text-[9px] text-red-600"></i>
                    {filters.lensType === 'cinema' ? 'Cinéma (T-stop)' : filters.lensType === 'autofocus' ? 'Autofocus (AF)' : 'Manuel'}
                    <button onClick={() => setFilters({ ...filters, lensType: 'all' })} className="ml-1 text-red-400 hover:text-red-700">×</button>
                  </span>
                )}
                {filters.filterDiameter && (
                  <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
                    <i className="fa-solid fa-circle-half-stroke text-[9px] text-red-600"></i>
                    Ø {filters.filterDiameter}
                    <button onClick={() => setFilters({ ...filters, filterDiameter: undefined })} className="ml-1 text-red-400 hover:text-red-700">×</button>
                  </span>
                )}
                {filters.brand !== 'all' && (
                  <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
                    <i className="fa-solid fa-building text-[9px] text-gray-500"></i>
                    {filters.brand}
                    <button onClick={() => setFilters({ ...filters, brand: 'all' })} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                  </span>
                )}
                {filters.mount !== 'all' && (
                  <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
                    <i className="fa-solid fa-camera text-[9px] text-gray-500"></i>
                    {filters.mount}
                    <button onClick={() => setFilters({ ...filters, mount: 'all' })} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                  </span>
                )}
                {globalSearchQuery && (
                  <span className="text-gray-500">
                    Recherche: "<strong className="text-gray-900">{globalSearchQuery}</strong>"
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <span className="hidden sm:inline">Trier par:</span>
                  <select
                    value={filters.sortBy}
                    onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-xs font-bold focus:outline-none focus:border-black"
                  >
                    <option value="default">En Vedette / Pertinence</option>
                    <option value="newest">Nouveautés</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs transition ${viewMode === 'grid' ? 'bg-white shadow text-black font-bold' : 'text-gray-400 hover:text-gray-700'}`}
                    aria-label="Mode Grille"
                  >
                    <i className="fa-solid fa-grip-vertical"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg text-xs transition ${viewMode === 'list' ? 'bg-white shadow text-black font-bold' : 'text-gray-400 hover:text-gray-700'}`}
                    aria-label="Mode Liste"
                  >
                    <i className="fa-solid fa-list"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Products Display */}
            {filteredProducts.length > 0 ? (
              <>
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                  : "flex flex-col gap-4"
                }>
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
                      onClick={() => setDisplayLimit(prev => prev + 12)}
                      className="px-8 py-3.5 bg-black hover:bg-red-600 text-white text-xs font-black tracking-widest uppercase rounded-2xl transition-all shadow-lg hover:shadow-red-200"
                    >
                      Charger Plus de Produits ({filteredProducts.length - displayLimit} restants)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-sm">
                <div className="text-red-500 mb-4">
                  <i className="fa-solid fa-search text-5xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Aucun matériel ne correspond à ces critères
                </h3>
                <p className="text-xs text-gray-500 mb-6 max-w-md mx-auto">
                  Essayez de réinitialiser la monture ou la marque pour afficher l'ensemble des équipements disponibles.
                </p>
                <button
                  onClick={() => {
                    setGlobalSearchQuery('');
                    setFilters({
                      category: 'all',
                      mount: 'all',
                      brand: 'all',
                      priceRange: [0, maxPrice],
                      inStockOnly: false,
                      sortBy: 'default'
                    });
                  }}
                  className="px-6 py-2.5 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition"
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
