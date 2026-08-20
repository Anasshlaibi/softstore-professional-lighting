import React from 'react';

export interface FilterState {
    category: string;
    mount: string;
    brand: string;
    lensType?: 'all' | 'cinema' | 'autofocus' | 'manual';
    filterDiameter?: string;
    productGroup?: 'new' | 'used' | 'rental';
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

    const handleMountChange = (mount: string) => {
        onFilterChange({ ...filters, mount });
    };

    const handleBrandChange = (brand: string) => {
        onFilterChange({ ...filters, brand });
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
            mount: 'all',
            brand: 'all',
            priceRange: [0, maxPrice],
            inStockOnly: false,
            sortBy: 'default'
        });
    };

    const hasActiveFilters =
        filters.category !== 'all' ||
        filters.mount !== 'all' ||
        filters.brand !== 'all' ||
        filters.inStockOnly ||
        filters.priceRange[0] > 0 ||
        filters.priceRange[1] < maxPrice;

    const mounts = [
        { id: 'all', label: 'Toutes montures' },
        { id: 'Sony E', label: 'Sony E' },
        { id: 'Canon RF', label: 'Canon RF' },
        { id: 'Canon EF', label: 'Canon EF' },
        { id: 'Nikon Z', label: 'Nikon Z' },
        { id: 'Fuji FX', label: 'Fuji X' },
        { id: 'M43', label: 'Micro 4/3' },
        { id: 'PL Mount', label: 'Cinema PL' }
    ];

    const brands = [
        { id: 'all', label: 'Toutes marques' },
        { id: '7Artisans', label: '7Artisans' },
        { id: 'Sony', label: 'Sony' },
        { id: 'Canon', label: 'Canon' },
        { id: 'Nikon', label: 'Nikon' }
    ];

    return (
        <div className="bg-gray-50 rounded-3xl p-5 md:p-6 mb-8 border border-gray-100 shadow-sm space-y-5">
            {/* Camera System & Mount Selector */}
            <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-2.5 uppercase tracking-wider flex items-center gap-2">
                    <i className="fa-solid fa-camera text-red-600"></i> Filtrer par Système Caméra / Monture
                </label>
                <div className="flex flex-wrap gap-2">
                    {mounts.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => handleMountChange(m.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                filters.mount === m.id
                                    ? 'bg-red-600 text-white shadow-md shadow-red-200'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-4 pt-2 border-t border-gray-200/60">
                {/* Category Filter */}
                <div className="flex-1">
                    <label className="block text-xs font-extrabold text-gray-700 mb-2 uppercase tracking-wider">
                        Catégorie Équipement
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                    filters.category === cat
                                        ? 'bg-black text-white shadow-md'
                                        : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {cat === 'all' ? 'Tous' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Brand Selector */}
                <div className="w-full lg:w-48">
                    <label className="block text-xs font-extrabold text-gray-700 mb-2 uppercase tracking-wider">
                        Marque
                    </label>
                    <select
                        value={filters.brand}
                        onChange={e => handleBrandChange(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black text-xs font-bold"
                    >
                        {brands.map(b => (
                            <option key={b.id} value={b.id} className="text-gray-900 bg-white font-medium">
                                {b.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort Dropdown */}
                <div className="w-full lg:w-48">
                    <label className="block text-xs font-extrabold text-gray-700 mb-2 uppercase tracking-wider">
                        Trier par
                    </label>
                    <select
                        value={filters.sortBy}
                        onChange={handleSortChange}
                        className="w-full px-3.5 py-2 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black text-xs font-bold"
                    >
                        <option value="default" className="text-gray-900 bg-white font-medium">Pertinence</option>
                        <option value="newest" className="text-gray-900 bg-white font-medium">Nouveautés</option>
                        <option value="price-asc" className="text-gray-900 bg-white font-medium">Prix croissant</option>
                        <option value="price-desc" className="text-gray-900 bg-white font-medium">Prix décroissant</option>
                    </select>
                </div>

                {/* Stock Filter */}
                <div className="flex items-center gap-3 pt-4 lg:pt-0">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.inStockOnly}
                            onChange={handleStockToggle}
                            className="w-4 h-4 text-black bg-white border-gray-300 rounded focus:ring-black focus:ring-2 cursor-pointer"
                        />
                        <span className="ml-2 text-xs font-bold text-gray-900">En stock</span>
                    </label>
                </div>
            </div>

            {/* Active Filters & Clear */}
            {hasActiveFilters && (
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {filters.mount !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                                Monture: {filters.mount}
                                <button onClick={() => handleMountChange('all')} className="ml-1 hover:text-gray-200">
                                    <i className="fa-solid fa-times text-xs"></i>
                                </button>
                            </span>
                        )}
                        {filters.category !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
                                {filters.category}
                                <button onClick={() => handleCategoryChange('all')} className="ml-1 hover:text-gray-300">
                                    <i className="fa-solid fa-times text-xs"></i>
                                </button>
                            </span>
                        )}
                        {filters.brand !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full">
                                Marque: {filters.brand}
                                <button onClick={() => handleBrandChange('all')} className="ml-1 hover:text-gray-300">
                                    <i className="fa-solid fa-times text-xs"></i>
                                </button>
                            </span>
                        )}
                        {filters.inStockOnly && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                                En stock
                                <button onClick={handleStockToggle} className="ml-1 hover:text-gray-200">
                                    <i className="fa-solid fa-times text-xs"></i>
                                </button>
                            </span>
                        )}
                    </div>
                    <button
                        onClick={clearFilters}
                        className="text-xs text-gray-600 hover:text-black font-bold transition-colors"
                    >
                        Réinitialiser tous les filtres
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductFilters;
