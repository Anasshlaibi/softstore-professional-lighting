import React from 'react';
import { FilterState } from './ProductFilters';
import { Product } from '../App';
import { extractProductAttributes, ProductAttributes } from '../src/utils/productMetadata';

interface CatalogSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  products: Product[];          // ALL products
  filteredProducts: Product[];  // Current filtered products
  categories: string[];
}

export const CatalogSidebar: React.FC<CatalogSidebarProps> = ({
  filters,
  onFilterChange,
  products,
  filteredProducts,
  categories,
}) => {
  // Pre-calculate all product attributes once for performance
  const productAttributesMap = React.useMemo(() => {
    const map = new Map<number, ProductAttributes>();
    products.forEach(p => {
      map.set(p.id, extractProductAttributes(p));
    });
    return map;
  }, [products]);

  // -----------------------------------------------------------
  // Active Group (Condition)
  // -----------------------------------------------------------
  const activeGroup = React.useMemo(() => {
    const catLower = (filters.category || '').toLowerCase();
    if (catLower.includes('occasion') || catLower.includes('seconde')) return 'used';
    if (catLower.includes('location') || catLower.includes('rental')) return 'rental';
    return filters.productGroup || 'all';
  }, [filters.category, filters.productGroup]);

  const handleGroupChange = (group: string) => {
    if (group === 'used') {
      const occasionCat = categories.find(c => c.toLowerCase().includes('occasion')) || 'Occasion';
      onFilterChange({ ...filters, category: occasionCat, productGroup: 'used' });
    } else if (group === 'rental') {
      const locationCat = categories.find(c => c.toLowerCase().includes('location')) || 'Location de Matériel';
      onFilterChange({ ...filters, category: locationCat, productGroup: 'rental' });
    } else if (group === 'new') {
      const isCurrentlySpecial = activeGroup === 'used' || activeGroup === 'rental';
      onFilterChange({ ...filters, category: isCurrentlySpecial ? 'all' : filters.category, productGroup: 'new' });
    } else {
      onFilterChange({ ...filters, category: 'all', productGroup: undefined });
    }
  };

  // -----------------------------------------------------------
  // Lens Type Counts (Cinema vs Autofocus vs Manual)
  // STRICT: Only applies to actual lenses!
  // -----------------------------------------------------------
  const lensTypeCounts = React.useMemo(() => {
    const counts = { cinema: 0, autofocus: 0, manual: 0, totalLenses: 0 };
    
    // Subset of products matching current brand/mount/condition
    products.forEach(p => {
      const attr = productAttributesMap.get(p.id);
      if (!attr || attr.product_type !== 'lens') return; // STRICT NON-LENS EXCLUSION

      if (filters.brand !== 'all' && attr.brand.toLowerCase() !== filters.brand.toLowerCase()) return;
      if (filters.mount !== 'all' && attr.mount !== filters.mount) return;
      if (filters.productGroup && attr.condition !== filters.productGroup) return;

      counts.totalLenses++;
      if (attr.lens_type === 'cinema') counts.cinema++;
      else if (attr.lens_type === 'autofocus') counts.autofocus++;
      else if (attr.lens_type === 'manual') counts.manual++;
    });

    return counts;
  }, [products, productAttributesMap, filters.brand, filters.mount, filters.productGroup]);

  // Is the current view primarily focused on lenses or filters?
  const isLensCategoryActive = React.useMemo(() => {
    if (filters.category === 'all') return true;
    const cl = filters.category.toLowerCase();
    return cl.includes('objectif') || cl.includes('lens') || cl.includes('cinéma') || cl.includes('cinema');
  }, [filters.category]);

  const isFilterCategoryActive = React.useMemo(() => {
    const cl = filters.category.toLowerCase();
    const bl = filters.brand.toLowerCase();
    return cl.includes('filtre') || cl.includes('filter') || bl.includes('k&f') || bl.includes('concept');
  }, [filters.category, filters.brand]);

  // -----------------------------------------------------------
  // Filter Diameter counts (for K&F & Filter products)
  // -----------------------------------------------------------
  const availableDiameters = [49, 52, 55, 58, 62, 67, 72, 77, 82, 95];

  // -----------------------------------------------------------
  // Category counts
  // -----------------------------------------------------------
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const attr = productAttributesMap.get(p.id);
      if (!attr) return;

      if (filters.brand !== 'all' && attr.brand.toLowerCase() !== filters.brand.toLowerCase()) return;
      if (filters.mount !== 'all' && attr.mount !== filters.mount) return;
      if (filters.lensType && filters.lensType !== 'all') {
        if (attr.product_type !== 'lens' || attr.lens_type !== filters.lensType) return;
      }

      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products, productAttributesMap, filters.brand, filters.mount, filters.lensType]);

  // -----------------------------------------------------------
  // Brand counts
  // -----------------------------------------------------------
  const brandCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const attr = productAttributesMap.get(p.id);
      if (!attr) return;

      if (filters.category !== 'all' && p.category !== filters.category) return;
      if (filters.mount !== 'all' && attr.mount !== filters.mount) return;
      if (filters.lensType && filters.lensType !== 'all') {
        if (attr.product_type !== 'lens' || attr.lens_type !== filters.lensType) return;
      }

      counts[attr.brand] = (counts[attr.brand] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);
  }, [products, productAttributesMap, filters.category, filters.mount, filters.lensType]);

  // -----------------------------------------------------------
  // Mount counts
  // -----------------------------------------------------------
  const mountCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const attr = productAttributesMap.get(p.id);
      if (!attr || !attr.mount || attr.mount === 'Universel') return;

      if (filters.category !== 'all' && p.category !== filters.category) return;
      if (filters.brand !== 'all' && attr.brand.toLowerCase() !== filters.brand.toLowerCase()) return;
      if (filters.lensType && filters.lensType !== 'all') {
        if (attr.product_type !== 'lens' || attr.lens_type !== filters.lensType) return;
      }

      counts[attr.mount] = (counts[attr.mount] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([mount, count]) => ({ mount, count }))
      .sort((a, b) => b.count - a.count);
  }, [products, productAttributesMap, filters.category, filters.brand, filters.lensType]);

  const resetFilters = () => {
    onFilterChange({
      category: 'all',
      mount: 'all',
      brand: 'all',
      lensType: 'all',
      filterDiameter: undefined,
      productGroup: undefined,
      priceRange: [0, 100000],
      inStockOnly: false,
      sortBy: 'default'
    });
  };

  // Category icon mapping
  const getCategoryIcon = (cat: string): string => {
    const cl = cat.toLowerCase();
    if (cl.includes('objectif') || cl.includes('lense') || cl.includes('lens')) return 'fa-circle-dot';
    if (cl.includes('caméra') || cl.includes('camera') || cl.includes('boitier')) return 'fa-camera';
    if (cl.includes('éclairage') || cl.includes('eclairage') || cl.includes('studio') || cl.includes('light')) return 'fa-lightbulb';
    if (cl.includes('stabilisateur') || cl.includes('gimbal')) return 'fa-arrows-rotate';
    if (cl.includes('filtre') || cl.includes('filter')) return 'fa-circle-half-stroke';
    if (cl.includes('adaptateur') || cl.includes('adapter')) return 'fa-plug';
    if (cl.includes('accessoire') || cl.includes('divers')) return 'fa-box-open';
    if (cl.includes('portable') || cl.includes('batterie')) return 'fa-battery-three-quarters';
    if (cl.includes('audio') || cl.includes('son') || cl.includes('micro')) return 'fa-microphone';
    return 'fa-tag';
  };

  const sidebarCategories = categories.filter(c => {
    const cl = c.toLowerCase();
    return c !== 'all' && !cl.includes('occasion') && !cl.includes('location');
  });

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" style={{ position: 'sticky', top: '88px', maxHeight: 'calc(100vh - 104px)', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Header & Reset */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0 bg-white">
        <div className="flex items-center gap-2 text-gray-900 font-extrabold text-sm">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
            <i className="fa-solid fa-sliders text-white text-[11px]"></i>
          </div>
          <span>Filtres Catalogue</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-[11px] text-gray-500 hover:text-red-600 flex items-center gap-1 font-bold transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
        >
          <i className="fa-solid fa-rotate-left text-[9px]"></i>
          Réinitialiser
        </button>
      </div>

      {/* Scrollable Filters Container */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* 1. Condition Filter (Tous / Neuf / Occasion / Location) */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Condition &amp; Disponibilité</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'all',    label: 'Tous',      icon: 'fa-border-all' },
              { id: 'new',    label: 'Neuf',      icon: 'fa-certificate' },
              { id: 'used',   label: 'Occasion',  icon: 'fa-recycle' },
              { id: 'rental', label: 'Location',  icon: 'fa-film' },
            ].map(item => {
              const active = activeGroup === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleGroupChange(item.id)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    active
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-600'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} text-[10px]`}></i>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. LENS TYPE FILTER (Cinema T-stop / Autofocus / Manuel) */}
        {isLensCategoryActive && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-900 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-dot text-red-600 text-[10px]"></i>
                Type d'Objectif
              </h4>
              {filters.lensType && filters.lensType !== 'all' && (
                <button
                  onClick={() => onFilterChange({ ...filters, lensType: 'all' })}
                  className="text-[10px] font-bold text-red-600 hover:underline"
                >
                  Effacer
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-1">
              {[
                { id: 'all',       label: 'Tous les objectifs', icon: 'fa-border-all', count: lensTypeCounts.totalLenses },
                { id: 'cinema',    label: 'Cinéma (T-stop)',    icon: 'fa-film',       count: lensTypeCounts.cinema, badge: 'T-Stop' },
                { id: 'autofocus', label: 'Autofocus (AF)',     icon: 'fa-bolt',       count: lensTypeCounts.autofocus, badge: 'AF' },
                { id: 'manual',    label: 'Manuel Classique',   icon: 'fa-hand',       count: lensTypeCounts.manual },
              ].map(typeItem => {
                const active = (filters.lensType || 'all') === typeItem.id;
                return (
                  <button
                    key={typeItem.id}
                    onClick={() => onFilterChange({ ...filters, lensType: active && typeItem.id !== 'all' ? 'all' : typeItem.id as any })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-red-600 text-white shadow-sm'
                        : typeItem.count === 0
                          ? 'text-gray-300 bg-gray-50/50 cursor-default'
                          : 'text-gray-700 bg-gray-50/70 hover:bg-red-50 hover:text-red-700 border border-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <i className={`fa-solid ${typeItem.icon} text-[10px] ${active ? 'text-white' : 'text-gray-400'}`}></i>
                      <span>{typeItem.label}</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                      active ? 'bg-white/20 text-white' : 'bg-gray-200/70 text-gray-600'
                    }`}>
                      {typeItem.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. FILTER DIAMETER SELECTOR (K&F Concept & Filters) */}
        {isFilterCategoryActive && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-900 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-half-stroke text-red-600 text-[10px]"></i>
                Diamètre du Filtre
              </h4>
              {filters.filterDiameter && (
                <button
                  onClick={() => onFilterChange({ ...filters, filterDiameter: undefined })}
                  className="text-[10px] font-bold text-red-600 hover:underline"
                >
                  Tous
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableDiameters.map(diam => {
                const active = filters.filterDiameter === `${diam}mm`;
                return (
                  <button
                    key={diam}
                    onClick={() => onFilterChange({
                      ...filters,
                      filterDiameter: active ? undefined : `${diam}mm`
                    })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                      active
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-red-400 hover:text-red-600'
                    }`}
                  >
                    Ø {diam}mm
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Category List */}
        <div className="space-y-2 pt-1 border-t border-gray-100">
          <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Catégories</h4>
          <div className="space-y-0.5">
            <button
              onClick={() => onFilterChange({ ...filters, category: 'all' })}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all group ${
                filters.category === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <i className={`fa-solid fa-border-all text-[11px] ${ filters.category === 'all' ? 'text-white' : 'text-gray-400 group-hover:text-gray-600' }`}></i>
                Toutes les catégories
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                filters.category === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {filteredProducts.length}
              </span>
            </button>

            {sidebarCategories.map(cat => {
              const active = filters.category === cat;
              const count = categoryCounts[cat] || 0;
              const icon = getCategoryIcon(cat);
              return (
                <button
                  key={cat}
                  onClick={() => onFilterChange({ ...filters, category: active ? 'all' : cat })}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all group ${
                    active
                      ? 'bg-red-600 text-white shadow-sm'
                      : count === 0
                        ? 'text-gray-300 cursor-default'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <i className={`fa-solid ${icon} text-[11px] ${
                      active ? 'text-white' : count === 0 ? 'text-gray-200' : 'text-gray-400 group-hover:text-red-500'
                    }`}></i>
                    <span className="truncate">{cat}</span>
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black shrink-0 ${
                    active ? 'bg-white/25 text-white' : count === 0 ? 'bg-gray-50 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Camera Mount Selector */}
        {mountCounts.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Monture &amp; Boîtier</h4>
              {filters.mount !== 'all' && (
                <button
                  onClick={() => onFilterChange({ ...filters, mount: 'all' })}
                  className="text-[10px] font-bold text-red-600 hover:underline"
                >
                  Toutes
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => onFilterChange({ ...filters, mount: 'all' })}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filters.mount === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Toutes les montures</span>
              </button>

              {mountCounts.map(({ mount, count }) => {
                const active = filters.mount === mount;
                return (
                  <button
                    key={mount}
                    onClick={() => onFilterChange({ ...filters, mount: active ? 'all' : mount })}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
                    }`}
                  >
                    <span>{mount}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                      active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Brand Selector */}
        {brandCounts.length > 1 && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Marque</h4>
              {filters.brand !== 'all' && (
                <button
                  onClick={() => onFilterChange({ ...filters, brand: 'all' })}
                  className="text-[10px] font-bold text-red-600 hover:underline"
                >
                  Toutes
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => onFilterChange({ ...filters, brand: 'all' })}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filters.brand === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Toutes les marques</span>
              </button>

              {brandCounts.map(({ brand, count }) => {
                const active = filters.brand.toLowerCase() === brand.toLowerCase();
                return (
                  <button
                    key={brand}
                    onClick={() => onFilterChange({ ...filters, brand: active ? 'all' : brand })}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
                    }`}
                  >
                    <span>{brand}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                      active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Stock Toggle */}
        <div className="pt-3 border-t border-gray-100">
          <label className="flex items-center cursor-pointer justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <i className="fa-solid fa-boxes-stacked text-[11px] text-gray-400"></i>
              En Stock Uniquement
            </span>
            <div
              onClick={() => onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly })}
              className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${
                filters.inStockOnly ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                filters.inStockOnly ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </div>
          </label>
        </div>

      </div>
    </aside>
  );
};
export default CatalogSidebar;
