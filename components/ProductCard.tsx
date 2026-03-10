import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Calendar, Play, Clock, Star, TrendingDown } from 'lucide-react';
import { Product } from '../App';
import { cn } from '../src/utils/cn';

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
    addToCart,
  }) => {
    const discount =
      product.oldPrice && product.oldPrice > product.price
        ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
        : 0;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="rounded-2xl overflow-hidden group relative flex flex-col h-full bg-white cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-2xl transition-all duration-300"
        onClick={() => onProductClick(product.id)}
      >
        {!product.inStock && (
          <div className="absolute top-2 left-2 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-20 flex items-center gap-1">
             <Clock size={12} /> Rupture
          </div>
        )}
        
        {product.rentPrice && product.rentPrice > 0 && (
          <div className="absolute top-2 right-2 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-20 flex items-center gap-1">
            <Calendar size={12} /> Location
          </div>
        )}

        {product.video && (
          <div className="absolute top-12 right-2 bg-black/50 text-white p-1.5 rounded-full shadow-sm z-20 backdrop-blur-sm">
            <Play size={12} fill="currentColor" />
          </div>
        )}

        <div className="h-auto aspect-[4/5] md:aspect-square bg-white flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-gray-50/50 transition-colors duration-500">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            src={product.image}
            alt={product.name}
            className={cn(
                "w-full h-full object-contain relative z-10 drop-shadow-sm group-hover:drop-shadow-2xl mix-blend-multiply",
                !product.inStock && "grayscale opacity-80"
            )}
            loading="lazy"
            width={400}
            height={400}
          />
        </div>

        <div className="p-4 md:p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
                <Star 
                    key={i} 
                    size={14} 
                    className={cn(
                        i < product.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                    )} 
                />
            ))}
          </div>
          
          <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 leading-tight line-clamp-2 group-hover:text-black transition-colors">
            {product.name}
          </h3>
          
          <p className="text-[10px] md:text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">
            {product.category}
          </p>

          {product.inStock && (
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-green-600 font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              En stock - Bouskoura
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-bold text-lg md:text-xl">
                  {product.price}{' '}
                  <span className="text-xs font-medium">{siteConfig.currency}</span>
                </span>
                {discount > 0 && (
                  <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <TrendingDown size={10} /> -{discount}%
                  </span>
                )}
              </div>
              {product.oldPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  {product.oldPrice} {siteConfig.currency}
                </span>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className={cn(
                  "p-3 rounded-full transition-all shadow-md flex items-center justify-center",
                  !product.inStock 
                    ? "bg-orange-100 text-orange-600 hover:bg-orange-200" 
                    : "bg-black text-white hover:bg-gray-800 hover:shadow-xl"
              )}
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
                <Clock size={18} />
              ) : (
                <ShoppingCart size={18} />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }
);

export default ProductCard;
