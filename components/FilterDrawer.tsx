import React, { useEffect } from 'react';
import { FilterState } from './ProductFilters';
import { Product } from '../App';
import { extractProductAttributes } from '../src/utils/productMetadata';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  products: Product[];
  filteredCount: number;
  categories: string[];
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  products,
  filteredCount,
  categories,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeFilterCount = [
    filters.category !== 'all',
    filters.mount !== 'all',
    filters.brand !== 'all',
    filters.lensType && filters.lensType !== 'all',
    filters.productGroup !== undefined,
    filters.inStockOnly,
    filters.filterDiameter !== undefined,
  ].filter(Boolean).length;

  const handleReset = () => {
    onFilterChange({
      category: 'all',
      mount: 'all',
      brand: 'all',
      lensType: 'all',
      filterDiameter: undefined,
      priceRange: [0, 100000],
      inStockOnly: false,
      sortBy: 'default',
    });
  };

  const brands = Array.from(
    new Set(
      products
        .map((p) => extractProductAttributes(p).brand)
        .filter((b) => b && b !== 'Autre')
    )
  ).sort();

  const mounts = ['Sony E', 'Nikon Z', 'Canon RF', 'Fuji FX', 'L Mount', 'M43', 'Canon EF'];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Filtres du catalogue">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-out drawer container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/80 dark:bg-gray-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center font-bold">
                <i className="fa-solid fa-sliders text-base" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Filtres Catalogue
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  {filteredCount} produit{filteredCount > 1 ? 's' : ''} trouvé{filteredCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 cursor-pointer"
                >
                  Réinitialiser
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label="Fermer les filtres"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>
          </div>

          {/* Drawer Body - Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Condition & Availability */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 block">
                Condition &amp; Disponibilité
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'Tous les produits', icon: 'fa-border-all' },
                  { id: 'new', label: 'Neuf Garantis', icon: 'fa-sparkles' },
                  { id: 'used', label: 'Occasions Certifiées', icon: 'fa-rotate' },
                  { id: 'rental', label: 'Location Matériel', icon: 'fa-film' },
                ].map((item) => {
                  const isActive =
                    item.id === 'all'
                      ? !filters.productGroup
                      : filters.productGroup === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        onFilterChange({
                          ...filters,
                          productGroup: item.id === 'all' ? undefined : (item.id as any),
                        })
                      }
                      className={`min-h-[44px] px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <i className={`fa-solid ${item.icon} text-xs`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lens Type */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 block">
                Type d'objectif
              </label>
              <div className="space-y-2">
                {[
                  { id: 'all', label: 'Tous les types' },
                  { id: 'cinema', label: 'Cinéma (T-stop)' },
                  { id: 'autofocus', label: 'Autofocus (AF)' },
                  { id: 'manual', label: 'Manuel Classique' },
                ].map((item) => {
                  const isActive = (filters.lensType || 'all') === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        onFilterChange({
                          ...filters,
                          lensType: item.id === 'all' ? 'all' : item.id,
                        })
                      }
                      className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white border-red-600 shadow-md'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <i className="fa-solid fa-check text-xs" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 block">
                Catégories
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, category: 'all' })}
                  className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition cursor-pointer ${
                    filters.category === 'all'
                      ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>Toutes les catégories</span>
                </button>
                {categories
                  .filter((c) => c !== 'all')
                  .map((cat) => {
                    const isActive = filters.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => onFilterChange({ ...filters, category: cat })}
                        className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition cursor-pointer ${
                          isActive
                            ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{cat}</span>
                        {isActive && <i className="fa-solid fa-check text-xs text-red-600" />}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Mounts */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 block">
                Monture &amp; Boîtier
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, mount: 'all' })}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    filters.mount === 'all'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  Toutes montures
                </button>
                {mounts.map((m) => {
                  const isActive = filters.mount === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onFilterChange({ ...filters, mount: m })}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 block">
                  Marque
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filters, brand: 'all' })}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      filters.brand === 'all'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Toutes marques
                  </button>
                  {brands.map((b) => {
                    const isActive = String(filters.brand || '').toLowerCase() === String(b || '').toLowerCase();
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => onFilterChange({ ...filters, brand: b })}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          isActive
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* In-Stock Switch */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Afficher uniquement les articles en stock
              </span>
              <button
                type="button"
                onClick={() =>
                  onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly })
                }
                className={`w-12 h-7 rounded-full p-1 transition duration-200 ease-in-out cursor-pointer min-h-[44px] min-w-[44px] flex items-center ${
                  filters.inStockOnly ? 'bg-emerald-500 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
                }`}
                aria-label="Filtrer uniquement les articles en stock"
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Footer Sticky Bar */}
          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-extrabold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer min-h-[44px]"
            >
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white text-xs font-black tracking-wide uppercase shadow-lg shadow-red-600/25 hover:brightness-105 active:scale-[0.99] transition cursor-pointer min-h-[44px]"
            >
              Voir les {filteredCount} produit{filteredCount > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;
