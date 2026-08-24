import React, { useState, useEffect } from 'react';
import { useCart } from '../src/context/CartContext';
import Logo from './Logo';

interface HeaderProps {
  onCartClick: () => void;
  siteConfig: { brandName: string; phone?: string };
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  onOpenProductRequest?: () => void;
  onOpenSearchModal?: () => void;
  onOpenNewArrivals?: () => void;
}

const Header: React.FC<HeaderProps> = React.memo(
  ({ onCartClick, siteConfig, globalSearchQuery, setGlobalSearchQuery, onOpenProductRequest, onOpenSearchModal, onOpenNewArrivals }) => {
    const { cartCount } = useCart();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
      const handleScroll = () => setIsScrolled(window.scrollY > 10);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
      if (isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    // Close mobile menu on Escape
    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const navLinkClass = `relative transition-colors after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-[-4px] after:left-0 after:transition-all after:duration-300 hover:after:w-full text-sm font-medium text-gray-600 hover:text-black after:bg-black`;

    return (
      <>
        <header
          className={`fixed w-full z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-sm ${
            isScrolled ? 'py-2' : 'py-3'
          }`}
        >
          <div className="container mx-auto px-4 md:px-6 h-16 md:h-16 flex items-center justify-between transition-all duration-300">

            {/* Logo */}
            <div
              className="flex items-center cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Logo theme="light" className="h-10 md:h-12 w-auto" />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-7 text-sm font-medium">
              <a href="/#products" className={navLinkClass}>Produits</a>
              <a href="/cinema-lenses-maroc" className={navLinkClass}>Cinéma</a>
              <a href="/a-propos" className={navLinkClass}>À Propos &amp; Marques</a>
              <a href="/#videos" className={navLinkClass}>Vidéos</a>

              {/* New In badge */}
              <button
                onClick={onOpenNewArrivals}
                className="relative flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all duration-200 bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping absolute -top-0.5 -right-0.5" />
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute -top-0.5 -right-0.5" />
                🔥 New In
              </button>

              <button
                onClick={onOpenProductRequest}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 bg-gray-100 text-gray-700 border-gray-200 hover:bg-black hover:text-white hover:border-black"
              >
                <span>🔍</span> Demander un Matériel
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Desktop Search */}
              <div
                onClick={() => onOpenSearchModal?.()}
                className="hidden md:flex relative items-center cursor-pointer transition-all duration-300 text-black"
              >
                <i className="fa-solid fa-search absolute left-3 text-sm opacity-70" />
                <input
                  type="text"
                  readOnly
                  placeholder="Rechercher..."
                  value={globalSearchQuery}
                  className="pl-9 pr-4 py-1.5 rounded-full text-sm outline-none cursor-pointer transition-all duration-500 border border-transparent focus:border-current/30 md:w-52 w-36 bg-gray-100 hover:bg-gray-200 text-black"
                />
              </div>

              {/* Mobile Search Icon */}
              <button
                onClick={() => onOpenSearchModal?.()}
                className="md:hidden p-2 rounded-full transition-colors bg-gray-100 text-black"
                aria-label="Rechercher"
              >
                <i className="fa-solid fa-search text-sm" />
              </button>

              {/* Cart */}
              <button
                onClick={onCartClick}
                className="relative group p-1"
                aria-label="Panier"
              >
                <div
                  className="p-2 rounded-full transition-colors duration-300 bg-gray-100 text-black hover:bg-black hover:text-white"
                >
                  <i className="fa-solid fa-bag-shopping text-lg block" />
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-full transition-colors bg-gray-100 text-black"
                aria-label="Menu"
              >
                <i className="fa-solid fa-bars text-base" />
              </button>
            </div>
          </div>
        </header>

        {/* ── Mobile Menu Drawer ─────────────────────────────────────────────── */}
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-72 z-[60] bg-[#0f0f0f] flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/10">
            <Logo theme="dark" className="h-8 w-auto" />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 flex flex-col px-5 py-6 space-y-1">
            <a
              href="/#products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-semibold"
            >
              <i className="fa-solid fa-grid-2 w-5 text-center text-gray-400 text-xs" />
              Produits
            </a>
            <a
              href="/cinema-lenses-maroc"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-semibold"
            >
              <i className="fa-solid fa-film w-5 text-center text-gray-400 text-xs" />
              Cinéma
            </a>
            <a
              href="/a-propos"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-semibold"
            >
              <i className="fa-solid fa-building w-5 text-center text-gray-400 text-xs" />
              À Propos &amp; Marques
            </a>
            <a
              href="/#videos"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-semibold"
            >
              <i className="fa-solid fa-play w-5 text-center text-gray-400 text-xs" />
              Vidéos
            </a>

            <div className="pt-3 border-t border-white/10 mt-3">
              {/* New In shortcut */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenNewArrivals?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600/15 border border-red-500/30 text-red-300 hover:bg-red-600/25 transition-colors text-sm font-bold mb-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                🔥 Nouveautés — New In
              </button>

              {/* Product Request */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenProductRequest?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 transition-colors text-sm font-semibold"
              >
                <i className="fa-solid fa-magnifying-glass w-5 text-center text-gray-500 text-xs" />
                Demander un Matériel
              </button>

              {/* Search */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSearchModal?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 transition-colors text-sm font-semibold"
              >
                <i className="fa-solid fa-search w-5 text-center text-gray-500 text-xs" />
                Rechercher
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="shrink-0 px-5 py-5 border-t border-white/10">
            <a
              href={`https://wa.me/${(siteConfig.phone || '+212600000000').replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:brightness-110 transition-all"
            >
              <i className="fa-brands fa-whatsapp text-base" />
              Contactez-nous sur WhatsApp
            </a>
            <p className="text-center text-[10px] text-gray-600 mt-3">
              Revendeur officiel 7Artisans au Maroc 🇲🇦
            </p>
          </div>
        </div>
      </>
    );
  }
);

export default Header;
