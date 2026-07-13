import React, { useState, useEffect } from 'react';
import { Product } from '../App';
import { useCart } from '../src/context/CartContext';
import richDescriptions from '../src/data/richDescriptions.json';

interface Promo {
  active: boolean;
  endDate: string;
}

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  buyNow: (id: number) => void;
  siteConfig: { currency: string; phone: string; promo: Promo };
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  buyNow,
  siteConfig,
}) => {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('desc');
  const [countdown, setCountdown] = useState<string>('');
  
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
  }, [siteConfig.promo]);

  const getYoutubeEmbedUrl = (urlOrId?: string) => {
    if (!urlOrId) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return `https://www.youtube.com/embed/${urlOrId}`;
    const regExp = /(?:v=|\/embed\/|\.be\/|youtu\.be\/|\/v\/)([^#\&\?]*).*/;
    const match = urlOrId.match(regExp);
    return match && match[1].length === 11 ? `https://www.youtube.com/embed/${match[1]}` : null;
  };
  const videoUrl = getYoutubeEmbedUrl(product.video);

  const openRentWhatsapp = () => {
    const phone = siteConfig.phone.replace('+', '');
    const msg = `Bonjour, je souhaite louer le matériel suivant : ${product.name}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const openReserveWhatsapp = () => {
    const phone = siteConfig.phone.replace('+', '');
    const msg = `Bonjour, je souhaite réserver le produit hors stock : ${product.name}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] overflow-y-auto backdrop-blur-sm" aria-hidden="false">
      <div className="min-h-screen flex items-center justify-center p-0 md:p-6 md:py-12">
        <div className="bg-white w-full max-w-[1400px] mx-auto md:rounded-3xl shadow-2xl overflow-hidden relative pb-24 md:pb-0 flex flex-col">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition shadow-sm"
            aria-label="Fermer"
          >
            <i className="fa-solid fa-xmark text-xl text-black"></i>
          </button>

          {siteConfig.promo.active && (
            <div className="w-full bg-red-600 text-white text-center py-2 z-20 shadow-md sticky top-0">
              <p className="text-xs font-bold tracking-widest uppercase flex justify-center items-center gap-2">
                <i className="fa-solid fa-bolt animate-pulse"></i> Offre Flash: <span className="font-mono text-sm">{countdown}</span>
              </p>
            </div>
          )}

          {/* TOP SECTION: Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(500px,_1fr)_minmax(450px,_500px)] gap-8 lg:gap-12 p-6 md:p-12 items-start">
            
            {/* Left Column: Gallery */}
            <div className="flex flex-col gap-4 w-full">
              <div className="w-full aspect-square md:aspect-[4/3] bg-gray-50 rounded-2xl flex items-center justify-center relative group overflow-hidden border border-gray-100">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={product.name}
                    onError={() => handleImageError(currentImage)}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-125"
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
                        alt={`Thumbnail ${idx + 1}`} 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Info & Actions */}
            <div className="flex flex-col bg-white">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 capitalize">
                {product.category}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4 leading-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-apple-red text-sm">
                  {Array.from({ length: 5 }, (_, i) => (
                    <i key={i} className={`fa-solid fa-star ${i < product.stars ? 'text-[#ff3b30]' : 'text-gray-200'}`}></i>
                  ))}
                </div>
                <span className="text-xs text-gray-400">(Avis Clients)</span>
                {product.inStock ? (
                  <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
                    En Stock
                  </span>
                ) : (
                  <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-600">
                    Rupture
                  </span>
                )}
              </div>

              {/* Pricing */}
              <div className="mb-8 pb-8 border-b border-gray-100">
                <div className="flex items-end gap-3 mb-2 flex-wrap">
                  <span className="text-4xl font-black text-green-600 leading-none">
                    {product.price} {siteConfig.currency}
                  </span>
                  {product.oldPrice && (
                    <span className="text-lg text-gray-400 line-through mb-1">
                      {product.oldPrice} {siteConfig.currency}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mb-1">
                      -{discount}%
                    </span>
                  )}
                </div>

                {product.rentPrice && product.rentPrice > 0 && (
                  <div className="flex items-baseline gap-2 mt-4 text-blue-600 bg-blue-50 w-fit px-4 py-2 rounded-lg">
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
                    className={`flex-1 h-16 text-white font-bold rounded-xl transition flex items-center justify-center gap-3 text-lg ${product.inStock ? 'bg-black hover:bg-gray-800' : 'bg-orange-500 hover:bg-orange-600'}`}
                  >
                    {product.inStock ? 'Acheter Maintenant' : 'Réserver sur WhatsApp'}
                    {product.inStock && <i className="fa-solid fa-arrow-right"></i>}
                  </button>
                </div>
                
                <div className="flex gap-3">
                  {videoUrl && (
                    <button
                      onClick={() => setActiveTab('video')}
                      className="flex-1 h-14 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2 border border-red-100"
                    >
                      <i className="fa-brands fa-youtube text-lg"></i> Voir la vidéo
                    </button>
                  )}
                  {product.rentPrice && product.rentPrice > 0 && (
                    <button
                      onClick={openRentWhatsapp}
                      className="flex-1 h-14 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2 border border-blue-100"
                    >
                      <i className="fa-brands fa-whatsapp text-lg"></i> Louer via WhatsApp
                    </button>
                  )}
                </div>
              </div>
              
              {/* Trust badges */}
              <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                 <div className="flex items-center gap-3 text-sm text-gray-600">
                    <i className="fa-solid fa-truck-fast text-gray-400 text-lg"></i>
                    <span>Livraison rapide partout au Maroc</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-gray-600">
                    <i className="fa-solid fa-shield-halved text-gray-400 text-lg"></i>
                    <span>Garantie constructeur officielle</span>
                 </div>
              </div>

            </div>
          </div>

          {/* BOTTOM SECTION: Full Width Description & Specs */}
          <div className="bg-gray-50 border-t border-gray-100 p-6 md:p-12 flex-grow">
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
            </div>

            <div className="max-w-5xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
              {activeTab === 'desc' && (
                <div>
                  {(richDescriptions as Record<string, string>)[product.id.toString()] ? (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: (richDescriptions as Record<string, string>)[product.id.toString()] 
                      }} 
                      className="prose prose-sm md:prose-base max-w-none prose-img:rounded-xl prose-img:mx-auto prose-headings:font-bold prose-a:text-blue-600 rich-description-content"
                    />
                  ) : (
                    <p
                      className="text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: product.desc.replace(/\n/g, '<br>'),
                      }}
                    ></p>
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <tbody>
                      {product.specs.map((spec, i) => {
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
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-lg max-w-4xl mx-auto">
                  <iframe
                    src={videoUrl}
                    title={product.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full absolute inset-0"
                  ></iframe>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Sticky Footer (Kept from original but styled better) */}
          <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 flex items-center gap-3">
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-xl font-black text-black leading-tight">
                {product.price} {siteConfig.currency}
              </span>
              {product.oldPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {product.oldPrice} {siteConfig.currency}
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
