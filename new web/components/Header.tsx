import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../src/context/CartContext';
import { ShoppingBag, X, Menu, Zap } from 'lucide-react';

interface HeaderProps {
  onCartClick: () => void;
  onAdminClick: () => void;
  siteConfig: { brandName: string; logo: string };
}

const Header: React.FC<HeaderProps> = React.memo(
  ({ onCartClick, onAdminClick, siteConfig }) => {
    const { cartCount } = useCart();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Admin Click Logic
    const logoClickCount = useRef(0);
    const lastClickTime = useRef(0);

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const handleLogoClick = () => {
      const now = Date.now();
      if (now - lastClickTime.current > 1000) {
        logoClickCount.current = 1;
      } else {
        logoClickCount.current += 1;
      }
      
      lastClickTime.current = now;

      if (logoClickCount.current === 3) {
        onAdminClick();
        logoClickCount.current = 0;
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      closeMobileMenu();
    };

    return (
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}
      >
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <Zap size={24} fill="white" className="text-white" />
            <span
              className={`text-2xl font-bold tracking-tight ${isScrolled || isMobileMenuOpen ? 'text-black' : 'text-white'}`}
            >
              GearShop.ma
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

          <div className="flex items-center gap-2 md:gap-5">
            <button
              onClick={onCartClick}
              className="relative group p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={`Voir le panier (${cartCount} articles)`}
            >
              <div
                className={`p-2.5 rounded-full transition-colors duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-gray-100 text-black hover:bg-black hover:text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                <ShoppingBag size={20} />
              </div>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden relative group p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <div
                className={`p-2.5 rounded-full transition-colors duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-gray-100 text-black hover:bg-black hover:text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-gray-100 ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="flex flex-col p-4 space-y-4 text-sm font-bold text-gray-800">
            <a 
              href="#collection" 
              onClick={closeMobileMenu}
              className="px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Produits
            </a>
            <a 
              href="#videos" 
              onClick={closeMobileMenu}
              className="px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Vidéos
            </a>
            <a 
              href="#whyus" 
              onClick={closeMobileMenu}
              className="px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              À Propos
            </a>
          </div>
        </div>
      </header>
    );
  }
);

export default Header;
