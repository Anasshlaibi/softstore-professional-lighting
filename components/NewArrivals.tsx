import React, { useMemo, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Product } from '../App';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface NewArrivalsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductClick?: (id: number) => void;
  siteConfig?: any;
}

// Strip HTML tags and return clean plain text
const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
    + (html.length > 160 ? '...' : '');
};

const NewArrivals: React.FC<NewArrivalsDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onProductClick,
}) => {
  const slides = useMemo(() => {
    if (!products) return [];
    const invoiceIds = [1027, 1002, 1004, 1035, 1021, 1019, 1018, 1030, 1015, 1023, 1043, 1060, 1061, 1062];
    return products
      .filter(p => invoiceIds.includes(p.id))
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.category || 'Accessory',
        price: p.price,
        oldPrice: p.oldPrice,
        desc: stripHtml(p.desc || ''),
        image: p.image || 'https://images.unsplash.com/photo-1502982720700-bfff97f2ec04?auto=format&fit=crop&q=80&w=800',
        inStock: p.inStock,
      }));
  }, [products]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-400 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel — slides in from the right */}
      <div
        className={`fixed top-0 right-0 h-full z-[70] w-full max-w-xl bg-[#0a0a0a] shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-modal="true"
        role="dialog"
        aria-label="Nouveautés"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">New In</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Nouveautés &amp; Arrivages</h2>
            <p className="text-xs text-gray-500 mt-0.5">Disponible maintenant • Livraison rapide 🇲🇦</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            aria-label="Fermer"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Scrollable Product List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {slides.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <i className="fa-solid fa-box-open text-3xl mb-3 opacity-40" />
              <p className="text-sm">Aucun produit récent</p>
            </div>
          ) : (
            slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => {
                  onProductClick?.(slide.id);
                  onClose();
                }}
                className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-3 transition-all duration-200 text-left group"
              >
                {/* Badge */}
                <div className="relative shrink-0">
                  {idx === 0 && (
                    <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10 uppercase tracking-wide">
                      NEW
                    </span>
                  )}
                  <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={slide.image}
                      alt={slide.name}
                      className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 truncate">
                      {slide.category}
                    </span>
                    {slide.inStock ? (
                      <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        En stock
                      </span>
                    ) : (
                      <span className="text-[9px] text-amber-400 font-bold">Sur commande</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-2">
                    {slide.name}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-white">
                      {slide.price.toLocaleString('fr-MA')} DH
                    </span>
                    {slide.oldPrice && (
                      <span className="text-xs text-gray-600 line-through">
                        {slide.oldPrice.toLocaleString('fr-MA')} DH
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <i className="fa-solid fa-chevron-right text-[10px] text-gray-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Footer CTA */}
        <div className="shrink-0 px-6 py-4 border-t border-white/10 bg-[#0a0a0a]">
          <a
            href="#products"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white text-black text-sm font-bold tracking-wide hover:bg-gray-100 transition-colors"
          >
            <i className="fa-solid fa-grid-2 text-xs" />
            Voir tout le catalogue
          </a>
        </div>
      </div>
    </>
  );
};

export default NewArrivals;
