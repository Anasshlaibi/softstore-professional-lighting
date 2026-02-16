import React, { useState } from 'react';
import { Product } from '../App';
import ProductCard from './ProductCard';
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
  const [filter, setFilter] = useState('all');
  const { addToCart } = useCart();

  const filteredProducts =
    filter === 'all' ? products : products.filter((p) => p.category === filter);

  // Sort by stock status
  filteredProducts.sort((a, b) =>
    a.inStock === b.inStock ? 0 : a.inStock ? -1 : 1
  );

  const openWhatsappReserve = (productName: string) => {
    const phone = siteConfig.phone.replace('+212', '673011873');
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
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-6 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-black mb-2">
              Catalogue.
            </h2>
            <p className="text-gray-500 text-sm">
              Vente et Location d&apos;équipement.
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar snap-x">
            {['all', 'studio', 'portable', 'accessories'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-xs md:text-sm font-medium px-4 py-2 rounded-full transition whitespace-nowrap snap-center ${filter === cat
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-500 hover:text-black bg-transparent'
                  }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="col-span-4 text-center text-gray-400 py-20 font-light">
            Aucun produit dans cette collection.
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
};

export default Products;

