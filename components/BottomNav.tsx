import React from 'react';
import { useCart } from '../src/context/CartContext';

interface BottomNavProps {
  onHomeClick?: () => void;
  onShopClick?: () => void;
  onCartClick: () => void;
  onSearchClick: () => void;
  siteConfig: { phone: string };
}

const BottomNav: React.FC<BottomNavProps> = ({
  onHomeClick,
  onShopClick,
  onCartClick,
  onSearchClick,
  siteConfig,
}) => {
  const { totalCount } = useCart();

  const handleHome = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleShop = () => {
    if (onShopClick) {
      onShopClick();
    } else {
      const el = document.getElementById('products');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleWhatsApp = () => {
    const phone = (siteConfig?.phone || '+212600000000').replace('+212', '212').replace(/\s+/g, '');
    const msg = encodeURIComponent('Bonjour GearShop Maroc, je souhaite avoir des informations sur un produit.');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-1.5 px-2 pb-safe"
    >
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* 1. Home Button */}
        <button
          type="button"
          onClick={handleHome}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 active:scale-95 transition-all cursor-pointer focus:outline-none"
          aria-label="Accueil"
        >
          <i className="fa-solid fa-house text-lg mb-1" />
          <span className="text-[10px] font-bold tracking-tight">Accueil</span>
        </button>

        {/* 2. Shop Button */}
        <button
          type="button"
          onClick={handleShop}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 active:scale-95 transition-all cursor-pointer focus:outline-none"
          aria-label="Boutique"
        >
          <i className="fa-solid fa-border-all text-lg mb-1" />
          <span className="text-[10px] font-bold tracking-tight">Boutique</span>
        </button>

        {/* 3. Cart Button (Prominent Brand Red Center Button with Badge) */}
        <div className="relative -top-3 flex flex-col items-center">
          <button
            type="button"
            onClick={onCartClick}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-red-600 via-red-700 to-red-800 text-white flex items-center justify-center shadow-lg shadow-red-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none ring-4 ring-white dark:ring-gray-900"
            aria-label={`Panier (${totalCount} articles)`}
          >
            <i className="fa-solid fa-bag-shopping text-xl" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-pulse">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </button>
          <span className="text-[10px] font-black text-red-600 dark:text-red-400 tracking-tight mt-0.5">
            Panier
          </span>
        </div>

        {/* 4. Search Button */}
        <button
          type="button"
          onClick={onSearchClick}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 active:scale-95 transition-all cursor-pointer focus:outline-none"
          aria-label="Recherche"
        >
          <i className="fa-solid fa-magnifying-glass text-lg mb-1" />
          <span className="text-[10px] font-bold tracking-tight">Recherche</span>
        </button>

        {/* 5. WhatsApp Button */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 active:scale-95 transition-all cursor-pointer focus:outline-none"
          aria-label="WhatsApp"
        >
          <i className="fa-brands fa-whatsapp text-xl mb-0.5 text-emerald-500" />
          <span className="text-[10px] font-bold tracking-tight text-emerald-600 dark:text-emerald-400">WhatsApp</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
