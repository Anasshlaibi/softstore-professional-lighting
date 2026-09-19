import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../src/context/CartContext';
import Logo from './Logo';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onCartClick: () => void;
  siteConfig: { brandName: string; phone?: string; whatsappPhone?: string };
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  onOpenProductRequest?: () => void;
  onOpenSearchModal?: () => void;
  onOpenNewArrivals?: () => void;
  onSelectCategory?: (category: string) => void;
  onSelectBrand?: (brand: string) => void;
}

const announcements = [
  { icon: 'fa-truck-fast', text: 'Livraison Rapide 24h/48h Gratuite partout au Maroc dès 500 DH' },
  { icon: 'fa-camera-retro', text: 'Nouvel Arrivage 2026 : Nikon ZR, Canon R5 II, Sony FX3 & A7 IV en stock' },
  { icon: 'fa-shield-halved', text: 'Matériel 100% Neuf & Garanti 1 An • Facture Pro & TVA Disponible' },
  { icon: 'fa-brands fa-whatsapp', text: 'Devis & Conseils Express WhatsApp au 06 73 01 18 73 • Réponse immédiate' }
];

const categoriesList = [
  { id: 'all', name: 'Tous les Produits', icon: 'fa-layer-group', link: '/#products' },
  { id: 'Appareils Photo', name: 'Appareils Photo & Hybrides', icon: 'fa-camera', link: '/#products?cat=Appareils Photo' },
  { id: 'Objectifs Photo', name: 'Objectifs Photo & Autofocus', icon: 'fa-circle-dot', link: '/#products?cat=Objectifs Photo' },
  { id: 'cinema', name: 'Caméras & Lentilles Cinéma', icon: 'fa-film', link: '/cinema-lenses-maroc' },
  { id: 'Éclairage', name: 'Éclairage Studio & Flash Godox', icon: 'fa-lightbulb', link: '/#products?cat=Éclairage' },
  { id: 'Stabilisateurs', name: 'Stabilisateurs DJI & Gimbals', icon: 'fa-arrows-to-dot', link: '/#products?cat=Stabilisateurs' },
  { id: 'Audio', name: 'Audio & Microphones Sans Fil', icon: 'fa-microphone', link: '/#products?cat=Audio' },
  { id: 'Cages & Rigging', name: 'Cages, Supports & Rigging SmallRig', icon: 'fa-wrench', link: '/#products?cat=Cages & Rigging' },
  { id: 'Trépieds & Sacs', name: 'Trépieds & Sacs Vanguard', icon: 'fa-briefcase', link: '/#products?cat=Trépieds & Sacs' },
];

const Header: React.FC<HeaderProps> = React.memo(
  ({
    onCartClick,
    siteConfig,
    globalSearchQuery,
    setGlobalSearchQuery,
    onOpenProductRequest,
    onOpenSearchModal,
    onOpenNewArrivals,
    onSelectCategory,
    onSelectBrand
  }) => {
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [currentAnnouncementIdx, setCurrentAnnouncementIdx] = useState(0);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    // Rotate announcements every 4 seconds
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentAnnouncementIdx((prev) => (prev + 1) % announcements.length);
      }, 4000);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      const handleScroll = () => setIsScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close category dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
          setIsCategoryDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
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

    const handleCategoryClick = (catId: string, link: string) => {
      setIsCategoryDropdownOpen(false);
      setIsMobileMenuOpen(false);
      if (link.startsWith('/#')) {
        if (onSelectCategory && catId !== 'cinema') {
          onSelectCategory(catId);
        }
        const el = document.getElementById('products');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else navigate('/');
      } else {
        navigate(link);
      }
    };

    const whatsappNumber = (siteConfig.phone || '212673011873').replace(/[^0-9]/g, '');

    return (
      <>
        {/* ── 1. Top Announcement Bar ──────────────────────────────────────── */}
        <div className="bg-[#0f172a] text-gray-200 text-[11px] sm:text-xs py-1 sm:py-1.5 px-3 sm:px-4 border-b border-slate-800 z-50 relative">
          <div className="container mx-auto flex items-center justify-between">
            {/* Announcement Ticker */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden py-0.5 max-w-full">
              <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0">
                INFO
              </span>
              <div className="flex items-center gap-1.5 transition-all duration-500 text-slate-300 text-[11px] sm:text-xs font-medium truncate">
                <i className={`fa-solid ${announcements[currentAnnouncementIdx].icon} text-red-400 text-xs shrink-0`} />
                <span className="truncate">{announcements[currentAnnouncementIdx].text}</span>
              </div>
            </div>

            {/* Quick Links & Hotline */}
            <div className="hidden lg:flex items-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <i className="fa-solid fa-location-dot text-red-500" /> Casablanca, Maroc
              </span>
              <span className="h-3 w-px bg-slate-700" />
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white hover:text-red-400 font-semibold transition"
              >
                <i className="fa-brands fa-whatsapp text-sm text-red-500" /> WhatsApp: 06 73 01 18 73
              </a>
              <span className="h-3 w-px bg-slate-700" />
              <button
                onClick={onOpenProductRequest}
                className="text-slate-300 hover:text-white transition flex items-center gap-1"
              >
                <i className="fa-solid fa-file-invoice" /> Demande de Devis
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. Main Sticky Header ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 sm:gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <Logo theme="light" className="h-8 sm:h-9 md:h-11 w-auto" />
              </Link>
            </div>

            {/* Omnisearch Bar */}
            <div
              onClick={() => onOpenSearchModal?.()}
              className="flex-1 max-w-2xl mx-1 sm:mx-2 md:mx-6 relative cursor-pointer group"
            >
              <div className="w-full flex items-center bg-gray-100 hover:bg-gray-50 border border-gray-200 group-hover:border-red-500/80 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 shadow-inner">
                <i className="fa-solid fa-magnifying-glass text-gray-400 group-hover:text-red-600 transition mr-2 sm:mr-3 text-xs sm:text-sm shrink-0" />
                <span className="text-gray-500 text-xs sm:text-sm truncate flex-1 select-none">
                  {globalSearchQuery || (
                    <>
                      <span className="sm:hidden">Rechercher appareil, objectif...</span>
                      <span className="hidden sm:inline">Rechercher : Nikon ZR, Sony A7 IV, Canon R5 II, DJI, Godox...</span>
                    </>
                  )}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 bg-white text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gray-200 shadow-sm shrink-0">
                  <i className="fa-solid fa-sliders text-[9px] text-red-500" /> Filtres
                </span>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
              {/* WhatsApp Quick CTA */}
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition font-bold text-xs shadow-sm"
              >
                <i className="fa-brands fa-whatsapp text-sm text-red-500 group-hover:text-white" />
                <span>Conseil Pro</span>
              </a>

              {/* Demander un Matériel */}
              <button
                onClick={onOpenProductRequest}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-black hover:text-white transition text-xs font-semibold border border-gray-200"
              >
                <span>🔍</span> Demander un Matériel
              </button>

              {/* Cart Button */}
              <button
                onClick={onCartClick}
                className="relative p-2 rounded-full bg-gray-100 hover:bg-black hover:text-white text-gray-800 transition duration-200 flex items-center justify-center"
                aria-label="Panier"
              >
                <i className="fa-solid fa-bag-shopping text-base" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
                aria-label="Menu"
              >
                <i className="fa-solid fa-bars text-base" />
              </button>
            </div>
          </div>

          {/* ── 3. Desktop Category Navigation Bar (Hidden on Mobile) ────────── */}
          <div className="hidden md:block bg-slate-900 text-white text-xs border-t border-slate-800">
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
              
              {/* Category Burger Dropdown Trigger */}
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-sm"
                >
                  <i className={`fa-solid ${isCategoryDropdownOpen ? 'fa-xmark' : 'fa-bars'} text-sm`} />
                  <span>TOUTES LES CATÉGORIES</span>
                  <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 w-72 bg-white text-gray-800 shadow-2xl rounded-b-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                      Rayons Professionnels
                    </div>
                    {categoriesList.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id, cat.link)}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center justify-between transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <i className={`fa-solid ${cat.icon} text-gray-400 group-hover:text-red-600 w-4 text-center`} />
                          <span>{cat.name}</span>
                        </div>
                        <i className="fa-solid fa-chevron-right text-[9px] text-gray-300 group-hover:text-red-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Horizontal Category Links */}
              <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 overflow-x-auto py-1.5 scrollbar-none font-medium">
                <Link
                  to="/"
                  className="px-2.5 py-1 text-slate-200 hover:text-white hover:bg-slate-800 rounded transition font-semibold"
                >
                  Accueil
                </Link>
                <button
                  onClick={() => handleCategoryClick('Appareils Photo', '/#products')}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                >
                  Appareils Photo
                </button>
                <button
                  onClick={() => handleCategoryClick('Objectifs Photo', '/#products')}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                >
                  Objectifs
                </button>
                <Link
                  to="/cinema-lenses-maroc"
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                >
                  Caméras Cinéma
                </Link>
                <button
                  onClick={() => handleCategoryClick('Éclairage', '/#products')}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                >
                  Éclairage
                </button>
                <button
                  onClick={() => handleCategoryClick('Stabilisateurs', '/#products')}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                >
                  Stabilisateurs
                </button>
                <button
                  onClick={() => handleCategoryClick('Audio', '/#products')}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                >
                  Audio
                </button>
                <button
                  onClick={() => handleCategoryClick('Cages & Rigging', '/#products')}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                >
                  Cages &amp; Rigging
                </button>
              </nav>

              {/* Special Highlight Badges */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenNewArrivals}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition font-bold text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  🔥 Nouveautés 2026
                </button>
              </div>

            </div>
          </div>
        </header>

        {/* ── Mobile Menu Drawer ─────────────────────────────────────────────── */}
        <div
          className={`fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div
          className={`fixed top-0 right-0 h-full w-80 z-[60] bg-[#0f172a] text-white flex flex-col transition-transform duration-300 md:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-slate-800">
            <Logo theme="dark" className="h-8 w-auto" />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>

          {/* Drawer Nav Links */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1">
              Catégories de Matériel
            </div>
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id, cat.link)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800 text-xs font-semibold transition text-left"
              >
                <i className={`fa-solid ${cat.icon} text-red-400 w-4 text-center`} />
                <span>{cat.name}</span>
              </button>
            ))}

            <div className="pt-3 border-t border-slate-800 mt-3 space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenNewArrivals?.();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-red-600/20 text-red-300 font-bold text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                🔥 Nouveautés — New In
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenProductRequest?.();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                <i className="fa-solid fa-file-invoice text-amber-400" />
                Demander un Matériel / Devis
              </button>
            </div>
          </div>

          {/* Mobile Drawer Footer */}
          <div className="shrink-0 px-4 py-4 border-t border-slate-800 bg-slate-950">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:brightness-110 transition shadow-md"
            >
              <i className="fa-brands fa-whatsapp text-sm" />
              WhatsApp : 06 73 01 18 73
            </a>
          </div>
        </div>
      </>
    );
  }
);

export default Header;
