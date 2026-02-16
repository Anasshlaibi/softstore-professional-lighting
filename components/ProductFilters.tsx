import React from 'react';

export interface FilterState {
    category: string;
    priceRange: [number, number];
    inStockOnly: boolean;
    sortBy: string;
}

interface ProductFiltersProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    categories: string[];
    maxPrice: number;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
    filters,
    onFilterChange,
    categories,
    maxPrice
}) => {
    const handleCategoryChange = (category: string) => {
        onFilterChange({ ...filters, category });
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, sortBy: e.target.value });
    };

    const handleStockToggle = () => {
        onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly });
    };

    const clearFilters = () => {
        onFilterChange({
            category: 'all',
            priceRange: [0, maxPrice],
            inStockOnly: false,
            sortBy: 'name-asc'
        });
    };

    const hasActiveFilters =
        filters.category !== 'all' ||
        filters.inStockOnly ||
        filters.priceRange[0] > 0 ||
        filters.priceRange[1] < maxPrice;

    return (
        <div className="bg-gray-50 rounded-2xl p-4 md:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Category Filter */}
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                        Catégorie
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.category === cat
                                        ? 'bg-black text-white shadow-md'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {cat === 'all' ? 'Tous' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Dropdown */}
                <div className="w-full lg:w-56">
                    <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                        Trier par
                    </label>
                    <select
                        value={filters.sortBy}
                        onChange={handleSortChange}
                        className="w-full px-4 py-2 pr-8 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    >
                        <option value="name-asc">Nom (A → Z)</option>
                        <option value="name-desc">Nom (Z → A)</option>
                        <option value="price-asc">Prix (Bas → Élevé)</option>
                        <option value="price-desc">Prix (Élevé → Bas)</option>
                    </select>
                </div>

                {/* Stock Filter */}
                <div className="flex items-center gap-3">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.inStockOnly}
                            onChange={handleStockToggle}
                            className="w-4 h-4 text-black bg-white border-gray-300 rounded focus:ring-black focus:ring-2 cursor-pointer"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">En stock uniquement</span>
                    </label>
                </div>
            </div>

            {/* Active Filters & Clear */}
            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {filters.category !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full">
                                {filters.category}
                                <button onClick={() => handleCategoryChange('all')} className="ml-1 hover:text-gray-300">
                                    <i className="fa-solid fa-times text-xs"></i>
                                </button>
                            </span>
                        )}
                        {filters.inStockOnly && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full">
                                En stock
                                <button onClick={handleStockToggle} className="ml-1 hover:text-gray-300">
                                    <i className="fa-solid fa-times text-xs"></i>
                                </button>
                            </span>
                        )}
                    </div>
                    <button
                        onClick={clearFilters}
                        className="text-sm text-gray-600 hover:text-black font-medium transition-colors"
                    >
                        Effacer tous les filtres
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductFilters;
