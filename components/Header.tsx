import React, { useState, useEffect } from 'react';
import { useCart } from '../src/context/CartContext';

interface HeaderProps {
  onCartClick: () => void;
  siteConfig: { brandName: string };
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
}

const Header: React.FC<HeaderProps> = React.memo(
  ({ onCartClick, siteConfig, globalSearchQuery, setGlobalSearchQuery }) => {
    const { cartCount } = useCart();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setGlobalSearchQuery(e.target.value);
      if (e.target.value && window.location.hash !== '#collection') {
        const el = document.getElementById('collection');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    return (
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}
      >
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white shadow-md">
              <i className="fa-solid fa-bolt text-sm"></i>
            </div>
            <span
              className={`text-lg md:text-xl font-bold tracking-tight ${isScrolled ? 'text-black' : 'text-white'}`}
            >
              {siteConfig.brandName}
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-10 text-sm font-medium">
            <a
              href="#collection"
              className={`relative ${isScrolled ? 'text-gray-600 hover:text-black' : 'text-gray-200 hover:text-white'} transition-colors after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-[-4px] after:left-0 ${isScrolled ? 'after:bg-black' : 'after:bg-white'} after:transition-all after:duration-300 hover:after:w-full`}
            >
              Produits
            </a>
            <a
              href="#videos"
              className={`relative ${isScrolled ? 'text-gray-600 hover:text-black' : 'text-gray-200 hover:text-white'} transition-colors after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-[-4px] after:left-0 ${isScrolled ? 'after:bg-black' : 'after:bg-white'} after:transition-all after:duration-300 hover:after:w-full`}
            >
              Vidéos
            </a>
            <a
              href="#whyus"
              className={`relative ${isScrolled ? 'text-gray-600 hover:text-black' : 'text-gray-200 hover:text-white'} transition-colors after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-[-4px] after:left-0 ${isScrolled ? 'after:bg-black' : 'after:bg-white'} after:transition-all after:duration-300 hover:after:w-full`}
            >
              À Propos
            </a>
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Global Search */}
            <div className={`hidden md:flex relative items-center transition-all duration-300 ${isScrolled ? 'text-black' : 'text-white'}`}>
              <i className="fa-solid fa-search absolute left-3 text-sm opacity-70"></i>
              <input 
                type="text" 
                placeholder="Rechercher..."
                value={globalSearchQuery}
                onChange={handleSearch}
                className={`pl-9 pr-4 py-1.5 rounded-full text-sm outline-none transition-all duration-300 bg-black/10 placeholder-current/70 border border-transparent focus:border-current/30 focus:w-48 w-36 ${isScrolled ? 'bg-gray-100 hover:bg-gray-200 focus:bg-white text-black' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              />
            </div>
            <button
              onClick={onCartClick}
              className="relative group p-1"
              aria-label="Panier"
            >
              <div
                className={`p-2 rounded-full transition-colors duration-300 ${isScrolled ? 'bg-gray-100 text-black hover:bg-black hover:text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                <i className="fa-solid fa-bag-shopping text-lg block"></i>
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    );
  }
);

export default Header;

