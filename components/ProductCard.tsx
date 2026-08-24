import React from 'react';
import { Product } from '../App';

interface ProductCardProps {
  product: Product;
  onProductClick: (id: number) => void;
  siteConfig: { currency: string; phone: string };
  openWhatsappReserve: (productName: string) => void;
  generateStars: (rating: number) => React.ReactNode[];
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
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 0;

    return (
      <div
        className="rounded-2xl overflow-hidden group relative flex flex-col h-full bg-white cursor-pointer border border-gray-200/80 hover:border-red-500/50 hover:shadow-xl transition-all duration-300"
        onClick={() => onProductClick(product.id)}
      >
        {/* Badges Top Bar */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex flex-col gap-1 items-start">
            {discount > 0 && (
              <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                -{discount}%
              </span>
            )}
            {!product.inStock && (
              <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                Sur Commande
              </span>
            )}
            {product.rentPrice && product.rentPrice > 0 && (
              <span className="bg-gray-800 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                <i className="fa-solid fa-calendar-check text-[8px]" /> Location
              </span>
            )}
          </div>

          {/* Video Icon or Wishlist Icon */}
          {product.video ? (
            <span className="bg-black/60 backdrop-blur text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] shadow-sm">
              <i className="fa-solid fa-play" />
            </span>
          ) : (
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/80 backdrop-blur text-gray-400 hover:text-red-600 flex items-center justify-center text-[10px] shadow-sm transition">
              <i className="fa-regular fa-heart" />
            </span>
          )}
        </div>

        {/* Product Image Area */}
        <div className="w-full aspect-square bg-gray-50/60 flex items-center justify-center p-3 sm:p-5 relative overflow-hidden group-hover:bg-red-50/20 transition-colors duration-500">
          <img
            src={product.image}
            alt={`${product.name} - GearShop Maroc`}
            title={`${product.name} - GearShop Maroc`}
            className={`max-w-full max-h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105 drop-shadow-sm ${
              !product.inStock ? 'grayscale opacity-75' : ''
            }`}
            loading="lazy"
            width={300}
            height={300}
          />
        </div>

        {/* Product Info & Action Section */}
        <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
          <div>
            {/* Category / Brand & Stars */}
            <div className="flex items-center justify-between mb-1 text-[10px]">
              <span className="font-black text-red-600 uppercase tracking-wider truncate max-w-[60%]">
                {product.category}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                <i className="fa-solid fa-star text-[9px]" />
                <span>{product.stars || 5}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-red-600 transition-colors">
              {product.name}
            </h3>
          </div>

          {/* Pricing & CTA Button */}
          <div className="pt-2 border-t border-gray-100 flex items-end justify-between gap-1 mt-auto">
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-xs sm:text-base font-black text-gray-900 tracking-tight">
                  {product.price > 0 ? (
                    <>
                      {product.price.toLocaleString('fr-MA')}{' '}
                      <span className="text-[9px] sm:text-xs font-bold text-gray-500">{siteConfig.currency}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">Sur devis</span>
                  )}
                </span>
              </div>

              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium leading-none">
                  {product.oldPrice.toLocaleString('fr-MA')} {siteConfig.currency}
                </span>
              )}
            </div>

            {/* Circular CTA Button */}
            <button
              type="button"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-600 hover:bg-red-700 active:scale-90 text-white flex items-center justify-center shadow-md shadow-red-600/25 transition cursor-pointer shrink-0 min-h-[36px] min-w-[36px]"
              onClick={(e) => {
                e.stopPropagation();
                if (!product.inStock) {
                  openWhatsappReserve(product.name);
                } else {
                  addToCart(product.id);
                }
              }}
              aria-label={`Ajouter ${product.name} au panier`}
            >
              {!product.inStock ? (
                <i className="fa-brands fa-whatsapp text-xs" />
              ) : (
                <i className="fa-solid fa-plus text-xs" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default ProductCard;
