import React, { useState, useMemo } from 'react';
import { Product } from '../App';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import ProductFilters, { FilterState } from './ProductFilters';
import { useCart } from '../src/context/CartContext';

interface ProductsProps {
    products: Product[];
    onProductClick: (id: number) => void;
    siteConfig: { currency: string; phone: string };
}

const Products: React.FC<ProductsProps> = ({
    products,
    onProductClick,
    siteConfig,
}) => {
    const { addToCart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate max price from products
    const maxPrice = useMemo(() =>
        Math.max(...products.map(p => p.price)),
        [products]
    );

    const [filters, setFilters] = useState<FilterState>({
        category: 'all',
        priceRange: [0, maxPrice],
        inStockOnly: false,
        sortBy: 'name-asc'
    });

    // Get unique categories
    const categories = useMemo(() => {
        const cats = ['all', ...Array.from(new Set(products.map(p => p.category)))];
        return cats;
    }, [products]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.desc.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (filters.category !== 'all') {
            filtered = filtered.filter(p => p.category === filters.category);
        }

        // Stock filter
        if (filters.inStockOnly) {
            filtered = filtered.filter(p => p.inStock);
        }

        // Price range filter
        filtered = filtered.filter(
            p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
        );

        // Sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (filters.sortBy) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'name-asc':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        // Keep in-stock items first
        return sorted.sort((a, b) =>
            a.inStock === b.inStock ? 0 : a.inStock ? -1 : 1
        );
    }, [products, searchQuery, filters]);

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
        <section id="collection" className="py-12 md:py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">
                        Notre Collection.
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base">
                        Des solutions d'éclairage pour chaque projet.
                    </p>
                </div>

                {/* Search Bar */}
                <SearchBar
                    onSearch={setSearchQuery}
                    placeholder="Rechercher un produit..."
                />

                {/* Filters */}
                <ProductFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    categories={categories}
                    maxPrice={maxPrice}
                />

                {/* Results Count */}
                <div className="mb-6 text-sm text-gray-600">
                    {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                        {filteredProducts.map((product) => (
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
                ) : (
                    <div className="text-center py-16">
                        <div className="text-gray-400 mb-4">
                            <i className="fa-solid fa-search text-6xl"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            Aucun produit trouvé
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Essayez d'ajuster vos filtres ou votre recherche
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setFilters({
                                    category: 'all',
                                    priceRange: [0, maxPrice],
                                    inStockOnly: false,
                                    sortBy: 'name-asc'
                                });
                            }}
                            className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                        >
                            Effacer tous les filtres
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Products;
