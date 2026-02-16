import React from 'react';
import { Product } from '../App';

interface ProductCardProps {
  product: Product;
  onProductClick: (id: number) => void;
  siteConfig: { currency: string; phone: string };
  openWhatsappReserve: (productName: string) => void;
  generateStars: (rating: number) => React.ReactElement[];
  addToCart: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({
    product,
    onProductClick,
    siteConfig,
    openWhatsappReserve,
    generateStars,
    addToCart,
  }) => {
    const discount =
      product.oldPrice && product.oldPrice > product.price
        ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
        : 0;

    return (
      <div
        className="rounded-2xl overflow-hidden group relative flex flex-col h-full bg-white cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300"
        onClick={() => onProductClick(product.id)}
      >
        {!product.inStock && (
          <div className="absolute top-2 left-2 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-20">
            Rupture
          </div>
        )}
        {product.rentPrice && product.rentPrice > 0 && (
          <div className="absolute bottom-24 right-2 md:bottom-auto md:top-2 md:left-auto md:right-2 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-20">
            <i className="fa-solid fa-calendar-check mr-1"></i> Location
          </div>
        )}
        {product.video && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-20">
            <i className="fa-solid fa-play"></i>
          </div>
        )}

        <div className="h-auto aspect-[4/5] md:aspect-square bg-white flex items-center justify-center p-0 relative overflow-hidden group-hover:bg-gray-50 transition-colors duration-500">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-sm group-hover:drop-shadow-xl mix-blend-multiply ${!product.inStock ? 'grayscale opacity-80' : ''}`}
            loading="lazy"
            width={400}
            height={400}
          />
        </div>

        <div className="p-3 md:p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-1 mb-1 md:mb-2">
            {generateStars(product.stars)}
          </div>
          <h3 className="text-sm md:text-lg font-bold text-black mb-1 leading-tight line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2 md:mb-4 uppercase">
            {product.category}
          </p>
          {product.inStock && (
            <div className="flex items-center gap-2 text-xs text-green-600 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Disponible immédiatement à Bouskoura
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-green-600 font-bold text-sm md:text-lg">
                  {product.price}{' '}
                  <span className="text-xs">{siteConfig.currency}</span>
                </span>
                {discount > 0 && (
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded ml-2">
                    -{discount}%
                  </span>
                )}
              </div>
              {product.oldPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  {product.oldPrice} {siteConfig.currency}
                </span>
              )}
              {product.rentPrice && product.rentPrice > 0 && (
                <span className="text-[10px] text-blue-500 font-medium mt-1">
                  Loc: {product.rentPrice} {siteConfig.currency}/j
                </span>
              )}
            </div>
            <button
              className={`text-xs font-bold py-2 rounded-full transition shadow-lg flex items-center gap-2 transform active:scale-95 duration-200 ${!product.inStock ? 'bg-orange-500 text-white hover:bg-orange-600 px-3' : 'bg-black text-white hover:bg-gray-800 px-4'}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!product.inStock) {
                  openWhatsappReserve(product.name);
                } else {
                  addToCart(product.id);
                }
              }}
            >
              {!product.inStock ? (
                <>
                  <i className="fa-solid fa-clock"></i> Réserver
                </>
              ) : (
                <>
                  <i className="fa-solid fa-plus"></i>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default ProductCard;
