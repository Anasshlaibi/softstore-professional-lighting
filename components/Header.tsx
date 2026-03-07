import React, { useState, useEffect } from 'react';
import { useCart } from '../src/context/CartContext';

interface HeaderProps {
  onCartClick: () => void;
  siteConfig: { brandName: string };
}

const Header: React.FC<HeaderProps> = React.memo(
  ({ onCartClick, siteConfig }) => {
    const { cartCount } = useCart();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}
      >
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              closeMobileMenu();
            }}
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white shadow-md">
              <i className="fa-solid fa-bolt text-sm"></i>
            </div>
            <span
              className={`text-lg md:text-xl font-bold tracking-tight ${isScrolled || isMobileMenuOpen ? 'text-black' : 'text-white'}`}
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

          <div className="flex items-center gap-2 md:gap-5">
            <button
              onClick={onCartClick}
              className="relative group p-1"
              aria-label="Panier"
            >
              <div
                className={`p-2 rounded-full transition-colors duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-gray-100 text-black hover:bg-black hover:text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                <i className="fa-solid fa-bag-shopping text-lg block"></i>
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden relative group p-1"
              aria-label="Menu"
            >
              <div
                className={`p-2 rounded-full transition-colors duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-gray-100 text-black hover:bg-black hover:text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg block`}></i>
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

