import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../../App';
import { matchProductWithQuery } from '../../utils/textNormalization';
import { slugify } from '../../utils/catalogEngine';

interface SearchModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (id: number, query?: string) => void;
  siteConfig: { currency: string };
  initialQuery?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  products,
  onClose,
  onSelectProduct,
  siteConfig,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialQuery && !query) {
        setQuery(initialQuery);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter products using shared intelligent keyword & alias matching
  const results = query.trim().length > 0
    ? products.filter(p => matchProductWithQuery(p, query))
    : [];

  const handleCopyLink = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const productSlug = slugify(product.name);
    const url = `${window.location.origin}/product/${product.id}-${productSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center p-4 sm:p-6 lg:p-20 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 z-[100] mt-10 md:mt-16">
        {/* Search Header Bar */}
        <div className="p-4 md:p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/80">
          <i className="fa-solid fa-search text-gray-400 text-lg"></i>
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher une lentille, caméra, filtre (ex: Sony 35mm, Canon RF, Black Mist...)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-black placeholder-gray-400 text-sm font-semibold outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs text-gray-600 transition"
              title="Effacer la recherche"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-gray-200/60 text-[11px] font-bold text-gray-600 hover:bg-gray-200"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {query.trim().length > 0 ? (
            results.length > 0 ? (
              <>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2 flex justify-between">
                  <span>{results.length} Produit(s) Trouvé(s)</span>
                  <span className="text-red-600">GearShop Maroc</span>
                </div>

                {results.slice(0, 10).map(product => {
                  const productSlug = slugify(product.name);
                  const productUrl = `/product/${product.id}-${productSlug}`;

                  return (
                    <Link
                      key={product.id}
                      to={productUrl}
                      state={{ fromSearch: true, searchQuery: query }}
                      onClick={() => {
                        onSelectProduct(product.id, query);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-white hover:bg-gray-50 border border-gray-100 hover:border-gray-300 cursor-pointer transition flex items-center gap-3 sm:gap-4 group relative block"
                    >
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100 p-1 flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-300"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                            {product.category}
                          </span>
                          {product.mount && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                              {product.mount}
                            </span>
                          )}
                          {product.isPreorder || (product as any).status === 'Précommande' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 ml-auto">
                              Précommande
                            </span>
                          ) : product.inStock ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 ml-auto">
                              En Stock
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 ml-auto">
                              Rupture
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-red-600 transition">
                          {product.name}
                        </h4>

                        {/* Direct link badge & Copy button */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 font-mono truncate max-w-[170px] sm:max-w-[260px] flex items-center gap-1">
                            <i className="fa-solid fa-link text-[9px] text-gray-300"></i>
                            {productUrl}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(e, product)}
                            className="text-[10px] font-bold text-gray-500 hover:text-red-600 px-1.5 py-0.5 rounded bg-gray-100 hover:bg-red-50 flex items-center gap-1 transition shrink-0"
                            title="Copier le lien direct du produit"
                          >
                            {copiedId === product.id ? (
                              <>
                                <i className="fa-solid fa-check text-green-600 text-[9px]"></i>
                                <span className="text-green-600 font-bold">Copié</span>
                              </>
                            ) : (
                              <>
                                <i className="fa-regular fa-copy text-[9px]"></i>
                                <span>Copier</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-black block">
                          {product.price > 0 ? `${product.price.toLocaleString('fr-MA')} ${siteConfig.currency}` : 'Sur demande'}
                        </span>
                        <span className="text-[10px] font-bold text-red-600 flex items-center justify-end gap-1 group-hover:translate-x-1 transition">
                          Voir <i className="fa-solid fa-arrow-right"></i>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </>
            ) : (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <i className="fa-solid fa-magnifying-glass text-3xl opacity-30"></i>
                <p className="text-sm font-medium">
                  Aucun matériel trouvé pour "<strong className="text-gray-700">{query}</strong>".
                </p>
                <p className="text-xs text-gray-400">
                  Essayez de rechercher par monture (ex: Sony E, Canon RF) ou par focale (ex: 35mm, 50mm).
                </p>
              </div>
            )
          ) : (
            <div className="py-8 px-4 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Recherches Fréquentes
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['35mm T2.1', '55mm Black Mist', 'PL 4-in-1', 'AF 135mm', 'Sony E', 'Canon RF', 'Nikon Z'].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-black hover:text-white text-xs font-bold text-gray-700 transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
