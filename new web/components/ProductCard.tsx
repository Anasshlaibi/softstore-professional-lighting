import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Calendar, Play, Clock, Star, TrendingDown, Flame, Zap } from 'lucide-react';
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
        className="rounded-2xl overflow-hidden group relative flex flex-col h-full bg-white dark:bg-zinc-900 cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-zinc-800 hover:shadow-2xl transition-all duration-300 shadow-sm"
        onClick={() => onProductClick(product.id)}
      >
        {!product.inStock && (
          <div className="absolute top-2 left-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-20 flex items-center gap-1">
             <Clock size={12} /> Rupture
          </div>
        )}
        
        {product.inStock && product.stars >= 4.9 && (
          <div className="absolute top-2 left-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-1 rounded shadow-sm z-20 flex items-center gap-1">
            <Flame size={12} className="text-orange-400 dark:text-orange-600" /> TOP SELLER
          </div>
        )}

        {product.inStock && product.stars < 4.9 && product.id % 3 === 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-20 flex items-center gap-1">
            <Zap size={12} /> STOCK FAIBLE
          </div>
        )}

        {product.rentPrice && product.rentPrice > 0 && (
          <div className="absolute top-2 right-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-20 flex items-center gap-1">
            <Calendar size={12} /> Location
          </div>
        )}

        {product.video && (
          <div className="absolute top-12 right-2 bg-black/50 text-white p-1.5 rounded-full shadow-sm z-20 backdrop-blur-sm">
            <Play size={12} fill="currentColor" />
          </div>
        )}

        <div className="h-auto aspect-[4/5] md:aspect-square bg-white dark:bg-zinc-800 flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-gray-50/50 dark:group-hover:bg-zinc-700/50 transition-colors duration-500 isolate">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            src={product.image}
            alt={`${product.name} - ${product.desc_fr || product.desc.split('\n')[0]} disponible à Casablanca Maroc`}
            className={cn(
                "w-full h-full object-contain relative z-10 drop-shadow-sm group-hover:drop-shadow-2xl transition-all duration-300",
                !product.inStock && "grayscale opacity-80",
                "mix-blend-multiply dark:mix-blend-normal"
            )}
            loading="lazy"
            width={400}
            height={400}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        <div className="p-4 md:p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
                <Star 
                    key={i} 
                    size={14} 
                    className={cn(
                        i < product.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-zinc-700"
                    )} 
                />
            ))}
             <span className="text-[10px] text-gray-400 font-bold ml-1">{product.stars.toFixed(1)}</span>
          </div>
          
          <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1 leading-tight line-clamp-2 group-hover:text-black dark:group-hover:text-zinc-300 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-[10px] md:text-xs text-gray-400 dark:text-zinc-500 mb-3 uppercase tracking-wider font-semibold">
            {product.category}
          </p>

          {product.inStock && (
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-green-600 dark:text-green-500 font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              En stock - Casablanca
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-gray-50 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 dark:text-white font-bold text-lg md:text-xl">
                  {product.price}{' '}
                  <span className="text-xs font-medium">{siteConfig.currency}</span>
                </span>
                {discount > 0 && (
                  <span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <TrendingDown size={10} /> -{discount}%
                  </span>
                )}
              </div>
              {product.oldPrice && (
                <span className="text-xs text-gray-400 dark:text-zinc-600 line-through font-medium">
                  {product.oldPrice} {siteConfig.currency}
                </span>
              )}
              {product.rentPrice && product.rentPrice > 0 && (
                <span className="text-xs text-[#666666] dark:text-zinc-400 font-medium mt-1">
                  Loc: {product.rentPrice} {siteConfig.currency}/j
                </span>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className={cn(
                  "min-w-[44px] min-h-[44px] p-2 rounded-full transition-all shadow-md flex items-center justify-center",
                  !product.inStock 
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 px-4" 
                    : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 hover:shadow-xl"
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
                <span className="flex items-center gap-2 font-bold text-xs"><Clock size={16} /> Réserver</span>
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
