import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Product } from '../App';
import { useCart } from '../src/context/CartContext';
import richDescriptions from '../src/data/richDescriptions.json';
import { ProductSEOSection } from './ProductSEOSection';
import { generateProductSEOPackage } from '../src/utils/seoGenerator';
import { findCompatibleAccessories, findAlternativeProducts, slugify } from '../src/utils/catalogEngine';
import { Link } from 'react-router-dom';

interface Promo {
  active: boolean;
  endDate: string;
}

interface ProductDetailModalProps {
  product: Product;
  allProducts?: Product[];
  onClose: () => void;
  buyNow: (id: number) => void;
  siteConfig: { currency: string; phone: string; promo: Promo };
  onOpenQuoteRequest?: (product: Product) => void;
  onOpenProductAlert?: (product: Product) => void;
  onSelectProduct?: (id: number) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts = [],
  onClose,
  buyNow,
  siteConfig,
  onOpenQuoteRequest,
  onOpenProductAlert,
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('desc');
  const [countdown, setCountdown] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Gallery Logic
  const initialGallery = Array.isArray(product.gallery) && product.gallery.length > 0 
    ? product.gallery 
    : (product.image ? [product.image] : []);
    
  const [galleryImages, setGalleryImages] = useState<string[]>(initialGallery);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentImage, setCurrentImage] = useState(initialGallery[0] || '');

  useEffect(() => {
    const valid = Array.isArray(product.gallery) && product.gallery.length > 0 
      ? product.gallery 
      : (product.image ? [product.image] : []);
    setGalleryImages(valid);
    setCurrentImage(valid[0] || '');
    setCurrentIdx(0);
    if (product.video) {
      setActiveTab('video');
    }
  }, [product]);

  const handleImageError = (brokenUrl: string) => {
    setGalleryImages(prev => {
      const filtered = prev.filter(img => img !== brokenUrl);
      if (currentImage === brokenUrl) {
        setCurrentImage(filtered[0] || '');
        setCurrentIdx(0);
      }
      return filtered;
    });
  };

  const handleNextImage = () => {
    if (galleryImages.length === 0) return;
    const nextIdx = (currentIdx + 1) % galleryImages.length;
    setCurrentIdx(nextIdx);
    setCurrentImage(galleryImages[nextIdx]);
  };

  const handlePrevImage = () => {
    if (galleryImages.length === 0) return;
    const prevIdx = (currentIdx - 1 + galleryImages.length) % galleryImages.length;
    setCurrentIdx(prevIdx);
    setCurrentImage(galleryImages[prevIdx]);
  };

  // Select Image from thumbnail
  const selectImage = (idx: number) => {
    setCurrentIdx(idx);
    setCurrentImage(galleryImages[idx]);
  };

  useEffect(() => {
    if (siteConfig.promo.active && siteConfig.promo.endDate) {
      const end = new Date(siteConfig.promo.endDate).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = end - now;
        if (distance < 0) {
          setCountdown('TERMINÉ');
          clearInterval(interval);
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          setCountdown(`${days}j ${hours}h ${minutes}m`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [siteConfig]);

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const openReserveWhatsapp = () => {
    const phone = siteConfig.phone.replace('+212', '212').replace(/\s+/g, '');
    const msg = `Bonjour, je souhaite réserver le produit : ${product.name} (Réf: ${product.id}) au prix de ${product.price > 0 ? `${product.price} DH` : 'sur demande'}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${product.id}-${slugify(product.name)}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - GearShop Maroc`,
          text: `Découvrez ${product.name} à ${product.price > 0 ? `${product.price.toLocaleString('fr-MA')} DH` : 'sur demande'} chez GearShop Maroc`,
          url: url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const videoUrl = product.video;

  // Cross-sell & alternative accessories
  const compatibleAccessories = useMemo(() => {
    return findCompatibleAccessories(allProducts, product);
  }, [allProducts, product]);

  const alternativeProducts = useMemo(() => {
    return findAlternativeProducts(allProducts, product);
  }, [allProducts, product]);

  const categorySlug = slugify(product.category || 'lenses');
  const brandSlug = slugify(product.brand || '7artisans');

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-0 md:p-6 animate-fade-in">
      <div
        className="bg-white w-full max-w-6xl min-h-screen md:min-h-0 md:max-h-[92vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dedicated Mobile Sticky Navigation Bar */}
        <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/90 px-3 py-2.5 flex items-center justify-between shadow-xs">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-900 font-bold text-xs transition shrink-0"
            aria-label="Retour"
          >
            <i className="fa-solid fa-arrow-left text-xs text-red-600"></i>
            <span>Retour</span>
          </button>

          <div className="flex-1 mx-2 min-w-0 text-center">
            <p className="text-xs font-bold text-gray-900 truncate">
              {product.name}
            </p>
            <p className="text-[10px] font-black text-red-600">
              {product.price > 0 ? `${product.price.toLocaleString('fr-MA')} ${siteConfig.currency}` : 'Sur devis'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-700 text-xs transition"
              title="Partager ce produit"
            >
              {isCopied ? <i className="fa-solid fa-check text-green-600 text-xs"></i> : <i className="fa-solid fa-share-nodes text-xs"></i>}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white active:scale-95 flex items-center justify-center text-gray-700 text-xs transition"
              aria-label="Fermer"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* Desktop Top Floating Close Button */}
        <button
          onClick={onClose}
          className="hidden md:flex absolute top-4 right-4 z-20 w-10 h-10 bg-gray-100 hover:bg-black hover:text-white text-gray-700 rounded-full items-center justify-center transition shadow-md"
          aria-label="Fermer la modal"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-grow pb-12 md:pb-0">
          {/* Breadcrumb Header with Copy Link button */}
          <div className="bg-gray-50 px-4 sm:px-6 py-2.5 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 gap-2 overflow-x-auto">
            <div className="flex items-center gap-2 whitespace-nowrap min-w-0">
              <Link to="/" onClick={onClose} className="hover:text-red-600 font-medium">Accueil</Link>
              <i className="fa-solid fa-chevron-right text-[8px] text-gray-400"></i>
              <Link to={`/categorie/${categorySlug}`} onClick={onClose} className="hover:text-red-600 font-medium capitalize">
                {product.category || 'Catégorie'}
              </Link>
              {product.brand && (
                <>
                  <i className="fa-solid fa-chevron-right text-[8px] text-gray-400"></i>
                  <Link to={`/marque/${brandSlug}`} onClick={onClose} className="hover:text-red-600 font-medium">
                    {product.brand}
                  </Link>
                </>
              )}
              <i className="fa-solid fa-chevron-right text-[8px] text-gray-400"></i>
              <span className="text-gray-900 font-bold truncate max-w-[140px] sm:max-w-xs">{product.name}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/product/${product.id}-${slugify(product.name)}`;
                navigator.clipboard.writeText(url);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              className="text-[11px] font-bold text-gray-600 hover:text-red-600 px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:border-red-200 flex items-center gap-1.5 transition shrink-0 shadow-xs"
              title="Copier le lien direct du produit"
            >
              {isCopied ? (
                <>
                  <i className="fa-solid fa-check text-green-600 text-xs"></i>
                  <span className="text-green-600 font-bold">Lien copié !</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-link text-[10px]"></i>
                  <span className="hidden sm:inline">Copier le lien</span>
                  <span className="sm:hidden">Lien</span>
                </>
              )}
            </button>
          </div>

          {/* MAIN TWO-COLUMN LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
            {/* Left Column: Image Gallery */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center p-6 group">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={`${product.name} - Vue principale`}
                    title={`${product.name} - GearShop Maroc`}
                    onError={() => handleImageError(currentImage)}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <i className="fa-regular fa-image text-4xl mb-2"></i>
                    <span>Image indisponible</span>
                  </div>
                )}
                
                {/* Arrow Controls */}
                {galleryImages.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-black rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-black rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto w-full py-2 no-scrollbar snap-x snap-mandatory">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectImage(idx)}
                      className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-center ${currentIdx === idx ? 'border-black ring-2 ring-black/10' : 'border-gray-200 hover:border-gray-400'}`}
                    >
                      <img 
                        src={img} 
                        onError={() => handleImageError(img)}
                        className="w-full h-full object-contain mix-blend-multiply p-1" 
                        alt={`${product.name} - Vue ${idx + 1}`} 
                        title={`${product.name} - Vue ${idx + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Info & Actions */}
            <div className="flex flex-col bg-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest capitalize">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[11px] font-bold">
                    {product.brand}
                  </span>
                )}
                {product.mount && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-bold">
                    {product.mount}
                  </span>
                )}
              </div>

              <h2 className="text-2xl lg:text-3xl font-black text-black mb-3 leading-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-apple-red text-sm">
                  {Array.from({ length: 5 }, (_, i) => (
                    <i key={i} className={`fa-solid fa-star ${i < product.stars ? 'text-[#ff3b30]' : 'text-gray-200'}`}></i>
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium">({product.stars || 4.9} / 5)</span>
                {product.inStock ? (
                  <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                    En Stock Casablanca
                  </span>
                ) : (
                  <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-600">
                    Sur commande
                  </span>
                )}
              </div>

              {/* Pricing */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-end gap-3 mb-2 flex-wrap">
                  {product.price > 0 ? (
                    <>
                      <span className="text-3xl md:text-4xl font-black text-green-600 leading-none">
                        {product.price.toLocaleString('fr-MA')} {siteConfig.currency}
                      </span>
                      {product.oldPrice && (
                        <span className="text-lg text-gray-400 line-through mb-1">
                          {product.oldPrice.toLocaleString('fr-MA')} {siteConfig.currency}
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mb-1">
                          -{discount}%
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <span className="text-2xl font-black text-gray-500">
                        Prix sur demande
                      </span>
                      <a
                        href={`https://wa.me/212673011873?text=${encodeURIComponent(`Bonjour, je souhaite connaître le prix de : ${product.name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-green-600 font-semibold hover:underline"
                      >
                        <i className="fa-brands fa-whatsapp"></i>
                        Demander le prix sur WhatsApp
                      </a>
                    </div>
                  )}
                </div>

                {product.rentPrice && product.rentPrice > 0 && (
                  <div className="flex items-baseline gap-2 mt-4 text-gray-800 bg-gray-100 w-fit px-4 py-2 rounded-lg">
                    <i className="fa-solid fa-tags text-sm"></i>
                    <span className="text-sm font-bold uppercase">Location:</span>
                    <span className="text-lg font-black">{product.rentPrice} {siteConfig.currency}</span>
                    <span className="text-xs opacity-80">/ jour</span>
                  </div>
                )}
              </div>

              {/* Add to Cart Actions */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={!product.inStock}
                    className="w-16 h-16 bg-gray-100 text-black font-bold rounded-xl hover:bg-gray-200 transition flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Ajouter au panier"
                  >
                    <i className="fa-solid fa-cart-plus text-xl"></i>
                  </button>
                  <button
                    onClick={() => {
                      if (product.inStock) {
                        addToCart(product.id);
                        buyNow(product.id);
                      } else {
                        openReserveWhatsapp();
                      }
                    }}
                    className={`flex-1 h-16 text-white font-bold rounded-xl transition flex items-center justify-center gap-3 text-base md:text-lg ${product.inStock ? 'bg-black hover:bg-gray-800' : 'bg-orange-500 hover:bg-orange-600'}`}
                  >
                    {product.inStock ? 'Acheter Maintenant' : 'Réserver sur WhatsApp'}
                    {product.inStock && <i className="fa-solid fa-arrow-right"></i>}
                  </button>
                </div>
                
                <div className="flex flex-col gap-2 pt-1">
                  {!product.inStock && onOpenProductAlert && (
                    <button
                      onClick={() => onOpenProductAlert(product)}
                      className="w-full h-12 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-xl transition flex items-center justify-center gap-2 border border-red-200 text-sm"
                    >
                      <i className="fa-solid fa-bell"></i> M'avertir dès disponibilité
                    </button>
                  )}
                  {onOpenQuoteRequest && (
                    <button
                      onClick={() => onOpenQuoteRequest(product)}
                      className="w-full h-12 bg-zinc-900 text-white hover:bg-black font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                      <i className="fa-solid fa-file-invoice"></i> Demander un Devis Pro / Studio
                    </button>
                  )}

                  {/* Share Product & WhatsApp */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex-1 h-11 bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-800 font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                      title="Partager le lien de ce produit"
                    >
                      {isCopied ? (
                        <>
                          <i className="fa-solid fa-check text-green-600 text-sm"></i>
                          <span className="text-green-600 font-bold">Lien copié !</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-share-nodes text-sm text-red-600"></i>
                          <span>Partager le produit</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/product/${product.id}-${slugify(product.name)}`;
                        const msg = `Regarde ce produit chez GearShop Maroc : ${product.name} (${product.price > 0 ? `${product.price.toLocaleString('fr-MA')} DH` : 'sur demande'})\n${url}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="h-11 px-3.5 bg-green-50 hover:bg-green-100 active:scale-98 text-green-700 font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-xs border border-green-200 cursor-pointer shrink-0"
                      title="Envoyer sur WhatsApp"
                    >
                      <i className="fa-brands fa-whatsapp text-base text-green-600"></i>
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                 <div className="flex items-start gap-3 text-sm text-gray-600">
                    <i className="fa-solid fa-truck-fast text-gray-400 text-lg mt-1"></i>
                    <div>
                      <span className="font-bold text-gray-800 block text-xs md:text-sm">Expédition sous 24h</span>
                      <span className="text-xs text-gray-500">Livraison rapide partout au Maroc</span>
                    </div>
                 </div>
                 <div className="flex items-start gap-3 text-sm text-gray-600">
                    <i className="fa-solid fa-shield-halved text-gray-400 text-lg mt-1"></i>
                    <div>
                      <span className="font-bold text-gray-800 block text-xs md:text-sm">Garantie 1 an</span>
                      <span className="text-xs text-gray-500">Distributeur officiel certifié</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Full Width Description & Specs */}
          <div className="bg-gray-50 border-t border-gray-100 p-6 md:p-10 flex-grow">
            <div className="flex gap-8 border-b border-gray-200 mb-8 max-w-5xl mx-auto">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-4 text-sm font-bold transition uppercase tracking-wider ${activeTab === 'desc' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-4 text-sm font-bold transition uppercase tracking-wider ${activeTab === 'specs' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Spécifications
              </button>
              {videoUrl && (
                <button
                  onClick={() => setActiveTab('video')}
                  className={`pb-4 text-sm font-bold transition uppercase tracking-wider ${activeTab === 'video' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Vidéo
                </button>
              )}
              <button
                onClick={() => setActiveTab('faq')}
                className={`pb-4 text-sm font-bold transition uppercase tracking-wider ${activeTab === 'faq' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Questions Fréquentes
              </button>
            </div>

            <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 mb-8">
              {activeTab === 'desc' && (
                <div>
                  <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-xl mb-6">
                    <img src="https://ui-avatars.com/api/?name=Anass+Hlaibi&background=0D8ABC&color=fff&size=128" alt="Anass Hlaibi" className="w-12 h-12 rounded-full shadow-sm" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Testé et approuvé par Anass Hlaibi</p>
                      <p className="text-xs text-gray-500">Expert Vidéo & Photo chez GearShop Maroc</p>
                    </div>
                  </div>
                  {(richDescriptions as Record<string, string>)[product.id.toString()] ? (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: (richDescriptions as Record<string, string>)[product.id.toString()] 
                      }} 
                      className="prose prose-sm md:prose-base max-w-none prose-img:rounded-xl prose-img:mx-auto prose-headings:font-bold prose-a:text-red-600 rich-description-content"
                    />
                  ) : (
                    <p
                      className="text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: (product.desc || '').replace(/\n/g, '<br>'),
                      }}
                    ></p>
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <tbody>
                      {(product.specs || []).map((spec, i) => {
                        const parts = spec.includes(':') || spec.includes('：') ? spec.split(/[:：]/) : [spec];
                        return (
                          <tr key={i} className="hover:bg-gray-50 transition">
                            {parts.length > 1 ? (
                              <>
                                <td className="font-bold bg-gray-50 border-b border-gray-100 p-4 w-1/3 text-gray-700">
                                  {parts[0].trim()}
                                </td>
                                <td className="border-b border-gray-100 p-4 text-gray-600">
                                  {parts.slice(1).join(':').trim()}
                                </td>
                              </>
                            ) : (
                              <td colSpan={2} className="border-b border-gray-100 p-4 text-gray-600">
                                {spec}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'video' && videoUrl && (
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-lg max-w-4xl mx-auto flex items-center justify-center">
                  {videoUrl.endsWith('.mp4') || videoUrl.startsWith('/') ? (
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={videoUrl}
                      title={product.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full absolute inset-0"
                    ></iframe>
                  )}
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Est-ce que le {product.name} est sous garantie au Maroc ?</h3>
                    <p className="text-gray-600">Oui, en tant que distributeur officiel, nous offrons une garantie constructeur d'un an sur ce produit chez GearShop Maroc.</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Faites-vous la livraison sur Casablanca et hors Casablanca ?</h3>
                    <p className="text-gray-600">Absolument. Nous expédions sous 24h à Casablanca et 2-4 jours dans tout le Maroc, avec livraison gratuite dès 500 DH.</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Puis-je tester ce produit avant l'achat ?</h3>
                    <p className="text-gray-600">Oui, vous pouvez passer à notre magasin physique à Casablanca pour tester ce matériel avec votre propre boîtier avant de vous décider.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Compatible Accessories Cross-Sell */}
            {compatibleAccessories.length > 0 && (
              <div className="max-w-5xl mx-auto mb-8 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-puzzle-piece text-red-600"></i>
                  Accessoires compatibles recommandés
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {compatibleAccessories.map(acc => (
                    <div
                      key={acc.id}
                      onClick={() => onSelectProduct && onSelectProduct(acc.id)}
                      className="group border border-gray-100 hover:border-black rounded-xl p-3 bg-gray-50 hover:bg-white transition cursor-pointer flex flex-col justify-between"
                    >
                      <div className="aspect-square bg-white rounded-lg p-2 mb-2 flex items-center justify-center">
                        <img
                          src={acc.image}
                          alt={acc.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{acc.category}</span>
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-600 transition line-clamp-2">{acc.name}</h4>
                        <span className="text-xs font-black text-green-700 mt-2 block">{acc.price.toLocaleString('fr-MA')} DH</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comprehensive SEO & Internal Linking Section */}
            <div className="max-w-5xl mx-auto">
              <ProductSEOSection
                product={product}
                allProducts={allProducts}
                onSelectProduct={onSelectProduct}
              />
            </div>
          </div>

          {/* Mobile Sticky Footer */}
          <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 flex items-center gap-3">
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-xl font-black text-black leading-tight">
                {product.price.toLocaleString('fr-MA')} {siteConfig.currency}
              </span>
              {product.oldPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {product.oldPrice.toLocaleString('fr-MA')} {siteConfig.currency}
                </span>
              )}
            </div>
            <button
              onClick={() => addToCart(product.id)}
              disabled={!product.inStock}
              className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-black font-bold disabled:opacity-50"
            >
              <i className="fa-solid fa-cart-plus"></i>
            </button>
            <button
              onClick={() => {
                if (product.inStock) {
                  addToCart(product.id);
                  buyNow(product.id);
                } else {
                  openReserveWhatsapp();
                }
              }}
              className={`h-12 px-6 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${product.inStock ? 'bg-black text-white' : 'bg-orange-500 text-white'}`}
            >
              {product.inStock ? 'Acheter' : 'Réserver'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
