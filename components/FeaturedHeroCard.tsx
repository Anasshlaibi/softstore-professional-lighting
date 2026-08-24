import React, { useState } from 'react';
import { Product } from '../App';
import { useCart } from '../src/context/CartContext';

interface FeaturedHeroCardProps {
  products: Product[];
  onProductClick: (id: number) => void;
  siteConfig: { currency: string; phone: string };
}

const FeaturedHeroCard: React.FC<FeaturedHeroCardProps> = ({
  products,
  onProductClick,
  siteConfig,
}) => {
  const { addToCart } = useCart();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const featuredProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const matches = products.filter(
      (p) =>
        p.name?.toLowerCase().includes('fx6') ||
        p.name?.toLowerCase().includes('24-70mm') ||
        p.name?.toLowerCase().includes('135mm') ||
        p.oldPrice ||
        p.category?.toLowerCase().includes('camera') ||
        p.category?.toLowerCase().includes('caméra')
    );

    return matches.length > 0 ? matches.slice(0, 3) : products.slice(0, 3);
  }, [products]);

  if (featuredProducts.length === 0) return null;

  const currentProduct = featuredProducts[activeSlideIndex] || featuredProducts[0];
  const currency = siteConfig?.currency || 'DH';
  const hasDiscount = currentProduct.oldPrice && currentProduct.oldPrice > currentProduct.price;

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(currentProduct);
  };

  return (
    <section className="w-full mb-8" aria-label="Produit en vedette">
      <div className="bg-gradient-to-b from-red-500/5 via-red-500/5 to-transparent p-4 sm:p-6 rounded-3xl border border-red-200/60 dark:border-gray-800 shadow-sm relative overflow-hidden">
        
        {/* 1. Top Pill Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-300 text-[11px] font-black uppercase tracking-wider border border-red-300/60">
            <i className="fa-solid fa-bolt text-red-600 text-[10px]" />
            CINEMA LINE • EN VEDETTE
          </span>
          <span className="text-[10px] font-bold text-gray-400">
            {activeSlideIndex + 1} / {featuredProducts.length}
          </span>
        </div>

        {/* 2. Content Header: Title & Subtitle */}
        <div className="mb-4">
          <h2
            onClick={() => onProductClick(currentProduct.id)}
            className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-2 hover:text-red-600 cursor-pointer transition"
          >
            {currentProduct.name}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed font-medium">
            {currentProduct.desc || 'Matériel audiovisuel pro haut de gamme disponible immédiatement au Maroc avec garantie complète.'}
          </p>
        </div>

        {/* 3. Pricing */}
        <div className="flex items-baseline gap-3 mb-5">
          <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {currentProduct.price?.toLocaleString('fr-MA')} {currency}
          </span>
          {hasDiscount && (
            <span className="text-sm font-bold text-gray-400 line-through">
              {currentProduct.oldPrice?.toLocaleString('fr-MA')} {currency}
            </span>
          )}
        </div>

        {/* 4. Priority Action Button (Brand Red CTA) */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 active:scale-[0.98] transition cursor-pointer min-h-[48px]"
          >
            <i className="fa-solid fa-bag-shopping text-base" />
            <span>Commander le Kit Cinéma</span>
            <i className="fa-solid fa-arrow-right text-xs" />
          </button>
        </div>

        {/* 5. Touch-friendly Product Image Card with Stock Badge & Nav */}
        <div
          onClick={() => onProductClick(currentProduct.id)}
          className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer group shadow-sm overflow-hidden"
        >
          {/* Stock Badge */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur border border-red-200 dark:border-gray-700 text-red-800 dark:text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {currentProduct.inStock ? 'Stock Marrakech' : 'Sur Commande'}
            </span>
          </div>

          {/* Product Image */}
          <div className="w-full h-56 sm:h-72 flex items-center justify-center relative">
            <img
              src={currentProduct.image}
              alt={currentProduct.name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-500"
              loading="eager"
            />
          </div>
        </div>

        {/* 6. Carousel Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          {/* Slide Dots */}
          <div className="flex items-center gap-1.5">
            {featuredProducts.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlideIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === activeSlideIndex ? 'w-6 bg-red-600' : 'w-2 bg-gray-300 dark:bg-gray-700'
                }`}
                aria-label={`Aller au slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Nav Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevSlide}
              className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition cursor-pointer min-h-[44px] min-w-[44px]"
              aria-label="Produit précédent"
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition cursor-pointer min-h-[44px] min-w-[44px]"
              aria-label="Produit suivant"
            >
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedHeroCard;
