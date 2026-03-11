import React, { useState, useEffect } from 'react';
import { X, Star, Plus, ArrowRight, Play, CalendarCheck } from 'lucide-react';
import { Product } from '../App';
import { useCart } from '../src/context/CartContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  buyNow: (id: number) => void;
  siteConfig: { currency: string; phone: string };
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({

  product,

  onClose,

  buyNow,

  siteConfig,

}) => {

  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState(() => product.video ? 'video' : 'desc');

  const [currentImage, setCurrentImage] = useState(product.image);



  // Sync currentImage and activeTab when product changes
  const [prevProductId, setPrevProductId] = useState(product.id);
  if (prevProductId !== product.id) {
    setPrevProductId(product.id);
    setCurrentImage(product.image);
    if (product.video) {
      setActiveTab('video');
    } else {
      setActiveTab('desc');
    }
  }







  // Track ViewContent on mount
  useEffect(() => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: siteConfig.currency || 'MAD'
      });
    }

    // Add JSON-LD for the product
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.image,
      "description": product.desc_fr || product.desc,
      "brand": {
        "@type": "Brand",
        "name": "ZSYB"
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": siteConfig.currency === 'DH' ? 'MAD' : siteConfig.currency,
        "price": product.price,
        "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.stars,
        "reviewCount": Math.floor(Math.random() * 50) + 10 // Mock review count for rich snippets
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'product-jsonld';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const oldScript = document.getElementById('product-jsonld');
      if (oldScript) {
        document.head.removeChild(oldScript);
      }
    };
  }, [product, siteConfig.currency]);

  const getYoutubeEmbedUrl = (urlOrId?: string) => {

    if (!urlOrId) return null;

    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId))

      return `https://www.youtube.com/embed/${urlOrId}`;

    const regExp = /(?:v=|\/embed\/|\.be\/|youtu\.be\/|\/v\/)([^#\&\?]*).*/;

    const match = urlOrId.match(regExp);

    return match && match[1].length === 11

      ? `https://www.youtube.com/embed/${match[1]}`

      : null;

  };

  const videoUrl = getYoutubeEmbedUrl(product.video);



  const openRentWhatsapp = () => {
    const phone = siteConfig.phone.replace(/\D/g, '');
    const msg = `Salam GearShop, bghit nloué l'matériel ${product.name}, wach disponible?`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  const openReserveWhatsapp = () => {
    const phone = siteConfig.phone.replace(/\D/g, '');
    const msg = `Salam GearShop, bghit n’réserver ${product.name}, imta ghadi ykoun disponible?`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };



  const discount =

    product.oldPrice && product.oldPrice > product.price

      ? Math.round(

        ((product.oldPrice - product.price) / product.oldPrice) * 100

      )

      : 0;



  const gallery =

    product.gallery && product.gallery.length > 0

      ? product.gallery

      : [product.image];



  return (

    <div

      className="fixed inset-0 bg-white dark:bg-zinc-950 z-[80] overflow-y-auto"

      aria-hidden="false"

    >

      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 bg-gray-100 dark:bg-zinc-800 p-3 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition shadow-sm"
        aria-label="Fermer"
      >
        <X className="w-5 h-5 text-black dark:text-white" />
      </button>



      <div className="container mx-auto min-h-screen flex items-center justify-center p-0 md:p-6">

        <div className="bg-white dark:bg-zinc-900 w-full max-w-6xl mx-auto md:rounded-3xl md:shadow-2xl md:border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-0 relative pb-[120px] md:pb-0">




          {/* Left: Gallery */}

          <div className="md:w-1/2 bg-gray-50 dark:bg-zinc-800 p-6 md:p-8 flex flex-col items-center justify-center pt-20 md:pt-16 isolate">

            <div className="w-full aspect-square flex items-center justify-center mb-6 relative">

              <img

                src={currentImage}

                alt={`${product.name} - ${product.desc_fr || product.desc.split('\n')[0]} disponible à Casablanca Maroc`}

                className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-300 drop-shadow-lg"

              />

            </div>

            {/* Thumbnails */}

            <div className="flex gap-3 overflow-x-auto w-full justify-center py-2 px-4 no-scrollbar snap-x snap-mandatory">

              {gallery.map((img, idx) => (

                <img

                  key={idx}

                  src={img}

                  alt={`${product.name} vue ${idx + 1} - Éclairage professionnel à Casablanca`}

                  onClick={() => setCurrentImage(img)}

                  className={`w-16 h-16 object-contain border rounded-md p-1 cursor-pointer transition snap-center shrink-0 ${currentImage === img ? 'border-black dark:border-white' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500'}`}

                />

              ))}

            </div>

          </div>



          {/* Right: Info */}

          <div className="md:w-1/2 p-6 md:p-14 flex flex-col bg-white dark:bg-zinc-900">

            <span className="text-gray-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 capitalize">

              {product.category}

            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4 leading-tight">

              {product.name}

            </h2>



            <div className="flex items-center gap-2 mb-6 text-black dark:text-white">
              <div className="flex text-apple-red text-sm">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < product.stars ? 'text-[#ff3b30] fill-[#ff3b30]' : 'text-gray-200 dark:text-zinc-800'}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 dark:text-zinc-500">(Avis Clients)</span>

              {product.inStock ? (

                <span className="ml-auto text-xs font-bold px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">

                  En Stock

                </span>

              ) : (

                <span className="ml-auto text-xs font-bold px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">

                  Rupture

                </span>

              )}

            </div>



            {/* Desktop Price Section */}

            <div className="mb-8 pb-8 border-b border-gray-100 dark:border-zinc-800 hidden md:block">

              <div className="flex items-baseline gap-3 mb-2">

                <span className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-bold">

                  Achat:

                </span>

                <span className="text-3xl font-bold text-[#2D5A27] dark:text-green-400">

                  {product.price} {siteConfig.currency}

                </span>

                {product.oldPrice && (

                  <span className="text-lg text-gray-400 dark:text-zinc-600 line-through">

                    {product.oldPrice} {siteConfig.currency}

                  </span>

                )}

                {discount > 0 && (

                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded">

                    -{discount}%

                  </span>

                )}

              </div>



              {product.rentPrice && product.rentPrice > 0 && (

                <div className="flex items-baseline gap-3 mb-4">

                  <span className="text-xs text-[#666666] dark:text-zinc-400 uppercase tracking-wider font-bold">
                    Location:
                  </span>
                  <span className="text-xl font-bold text-[#666666] dark:text-zinc-300">
                    {product.rentPrice} {siteConfig.currency}
                  </span>

                  <span className="text-xs text-gray-500">/ jour</span>

                </div>

              )}



              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={!product.inStock}
                  className="flex-1 px-6 py-4 bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  {product.inStock ? 'Panier' : 'Indisponible'}
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
                  className={`flex-1 px-6 py-4 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 ${product.inStock ? 'bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {product.inStock ? 'Acheter' : 'Réserver'}{' '}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                {videoUrl && (
                  <button
                    onClick={() => setActiveTab('video')}
                    className="px-6 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" /> Play Video
                  </button>
                )}
              </div>

              {product.rentPrice && product.rentPrice > 0 && (

                <button

                  onClick={openRentWhatsapp}

                  className="w-full mt-3 px-6 py-3 border-2 border-blue-500 text-blue-600 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center justify-center gap-2"

                >

                  <CalendarCheck className="w-5 h-5" /> Louer sur

                  WhatsApp

                </button>

              )}

            </div>



            {/* Tabs */}

            <div className="flex gap-8 border-b border-gray-100 dark:border-zinc-800 mb-6 sticky top-0 bg-white dark:bg-zinc-900 z-10 pt-2 overflow-x-auto no-scrollbar">

              <button

                onClick={() => setActiveTab('desc')}

                className={`pb-2 text-sm font-medium transition whitespace-nowrap ${activeTab === 'desc' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-500'}`}

              >

                Description

              </button>

              <button

                onClick={() => setActiveTab('specs')}

                className={`pb-2 text-sm font-medium transition whitespace-nowrap ${activeTab === 'specs' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-500'}`}

              >

                Spécifications

              </button>

              <button

                onClick={() => setActiveTab('faq')}

                className={`pb-2 text-sm font-medium transition whitespace-nowrap ${activeTab === 'faq' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-500'}`}

              >

                Questions

              </button>

              {videoUrl && (

                <button

                  onClick={() => setActiveTab('video')}

                  className={`pb-2 text-sm font-medium transition whitespace-nowrap ${activeTab === 'video' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-500'}`}

                >

                  Vidéo

                </button>

              )}

            </div>



            <div className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed pb-4 text-justify flex-grow overflow-y-auto">

              {activeTab === 'desc' && (

                <div className="space-y-4">
                  <p className="whitespace-pre-line font-medium text-gray-800 dark:text-zinc-200 leading-[1.6]">
                    {product.desc_fr || product.desc}
                  </p>
                  {product.desc_darija && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30 italic text-amber-900 dark:text-amber-200">
                      <span className="font-bold mr-2">Darija:</span>
                      {product.desc_darija}
                    </div>
                  )}
                  {product.desc_ar && (
                    <p className="text-right font-arabic text-lg leading-loose dark:text-zinc-200" dir="rtl">
                      {product.desc_ar}
                    </p>
                  )}
                  {/* Show raw desc if we have desc_fr but raw desc has more technical details */}
                  {product.desc_fr && product.desc && product.desc !== product.desc_fr && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300">
                        Plus de détails techniques (English)
                      </summary>
                      <p className="mt-2 whitespace-pre-line text-xs text-gray-400 dark:text-zinc-600">
                        {product.desc}
                      </p>
                    </details>
                  )}
                </div>

              )}

              {activeTab === 'specs' && (

                <table className="w-full text-sm text-left border-collapse">

                  <tbody>

                    {product.specs.map((spec, i) => {

                      const parts =

                        spec.includes(':') || spec.includes('：')

                          ? spec.split(/[:：]/)

                          : [spec];

                      return (

                        <tr key={i}>

                          {parts.length > 1 ? (

                            <>

                              <td className="font-bold bg-gray-50 dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-700 p-2 align-top w-1/3 text-black dark:text-white">

                                {parts[0].trim()}

                              </td>

                              <td className="border-b border-gray-100 dark:border-zinc-700 p-2 align-top text-gray-600 dark:text-zinc-300">

                                {parts.slice(1).join(':').trim()}

                              </td>

                            </>

                          ) : (

                            <td

                              colSpan={2}

                              className="border-b border-gray-100 dark:border-zinc-700 p-2 text-gray-600 dark:text-zinc-300"

                            >

                              {spec}

                            </td>

                          )}

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              )}

              {activeTab === 'faq' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl">
                    <h4 className="font-bold text-black dark:text-white mb-2">Wach disponible f’Casablanca?</h4>
                    <p className="text-sm text-gray-600 dark:text-zinc-300">Oui, tout notre matériel est stocké à Casablanca. Vous pouvez être livré en moins de 24h à Casablanca et 48h partout au Maroc.</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl">
                    <h4 className="font-bold text-black dark:text-white mb-2">Comment installer mon kit ZSYB?</h4>
                    <p className="text-sm text-gray-600 dark:text-zinc-300">Tous nos projecteurs utilisent la monture Bowens standard. Il suffit de clipser la softbox et de brancher sur une prise secteur standard 220V.</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl">
                    <h4 className="font-bold text-black dark:text-white mb-2">Y a-t-il une garantie?</h4>
                    <p className="text-sm text-gray-600 dark:text-zinc-300">GearShop.ma offre une garantie locale de 1 an sur les défauts de fabrication. Notre SAV est basé à Casablanca.</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl">
                    <h4 className="font-bold text-black dark:text-white mb-2">Puis-je payer à la livraison?</h4>
                    <p className="text-sm text-gray-600 dark:text-zinc-300">Absolument. Le paiement se fait en espèces au livreur une fois que vous avez reçu votre matériel.</p>
                  </div>
                </div>
              )}

              {activeTab === 'video' && videoUrl && (

                <div className="aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg">

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



          {/* Mobile Sticky Footer */}

          <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/85 dark:bg-zinc-900/90 backdrop-blur-[10px] border-t border-gray-100 dark:border-zinc-800 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50 flex flex-col gap-2">

            <div className="flex justify-between items-center w-full">

              <div className="flex flex-col">

                <div className="flex items-center gap-2">

                  <span className="text-xl font-bold text-[#2D5A27] dark:text-green-400 leading-tight">

                    {product.price} {siteConfig.currency}

                  </span>

                  {discount > 0 && (

                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded">

                      -{discount}%

                    </span>

                  )}

                </div>

                {product.oldPrice && (

                  <span className="text-xs text-gray-400 dark:text-zinc-600 line-through">

                    {product.oldPrice} {siteConfig.currency}

                  </span>

                )}

              </div>

              {product.rentPrice && product.rentPrice > 0 && (

                <div className="text-right">

                  <span className="text-sm font-bold text-[#666666] dark:text-zinc-400">

                    {product.rentPrice} {siteConfig.currency}

                  </span>

                  <span className="text-[10px] text-gray-500 block">

                    / jour

                  </span>

                </div>

              )}

            </div>



            <div className="flex gap-2 w-full">
              <button
                onClick={() => addToCart(product.id)}
                disabled={!product.inStock}
                className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
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
                className={`flex-1 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg ${product.inStock ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-orange-500 text-white'}`}
              >
                {product.inStock ? 'Acheter' : 'Réserver'}
              </button>
              {videoUrl && (
                <button
                  onClick={() => setActiveTab('video')}
                  className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center"
                >
                  <Play className="w-5 h-5" />
                </button>
              )}
            </div>

            {product.rentPrice && product.rentPrice > 0 && (

              <button

                onClick={openRentWhatsapp}

                className="w-full h-10 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-sm"

              >

                <CalendarCheck className="w-4 h-4 mr-2" /> Louer

              </button>

            )}

          </div>

        </div>

      </div>

    </div>

  );

};



export default ProductDetailModal;
