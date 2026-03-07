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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Added mobile state

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMobileMenu = () => {
      setIsMobileMenuOpen(false);
    };

    return (
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}
      >
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          
          {/* Logo Section */}
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10 text-sm font-medium">
            <a href="#collection" className={`relative ${isScrolled ? 'text-gray-600 hover:text-black' : 'text-gray-200 hover:text-white'} transition-colors`}>Produits</a>
            <a href="#videos" className={`relative ${isScrolled ? 'text-gray-600 hover:text-black' : 'text-gray-200 hover:text-white'} transition-colors`}>Vidéos</a>
            <a href="#whyus" className={`relative ${isScrolled ? 'text-gray-600 hover:text-black' : 'text-gray-200 hover:text-white'} transition-colors`}>À Propos</a>
          </nav>

          {/* Cart & Mobile Toggle */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Cart Button */}
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

            {/* Mobile Menu Hamburger Button */}
            <button
              className={`md:hidden p-2 rounded-full transition-colors ${isScrolled || isMobileMenuOpen ? 'text-black' : 'text-white bg-white/20'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl block`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 py-4 flex flex-col px-6 gap-4">
            <a href="#collection" onClick={closeMobileMenu} className="text-gray-800 font-medium text-lg py-2 border-b border-gray-50">Produits</a>
            <a href="#videos" onClick={closeMobileMenu} className="text-gray-800 font-medium text-lg py-2 border-b border-gray-50">Vidéos</a>
            <a href="#whyus" onClick={closeMobileMenu} className="text-gray-800 font-medium text-lg py-2 border-b border-gray-50">À Propos</a>
          </div>
        )}
      </header>
    );
  }
);

export default Header;