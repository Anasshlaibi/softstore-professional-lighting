import React, { useState, useEffect } from 'react';
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

    const phone = siteConfig.phone.replace('+', '');

    const msg = `Bonjour, je souhaite louer le matériel suivant : ${product.name}`;

    window.open(

      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,

      '_blank'

    );

  };



  const openReserveWhatsapp = () => {

    const phone = siteConfig.phone.replace('+', '');

    const msg = `Bonjour, je souhaite réserver le produit hors stock : ${product.name}`;

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

      className="fixed inset-0 bg-white z-[80] overflow-y-auto"

      aria-hidden="false"

    >

      <button

        onClick={onClose}

        className="fixed top-4 right-4 z-50 bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition shadow-sm"

        aria-label="Fermer"

      >

        <i className="fa-solid fa-xmark text-xl text-black"></i>

      </button>



      <div className="container mx-auto min-h-screen flex items-center justify-center p-0 md:p-6">

        <div className="bg-white w-full max-w-6xl mx-auto md:rounded-3xl md:shadow-2xl md:border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-0 relative pb-20 md:pb-0">




          {/* Left: Gallery */}

          <div className="md:w-1/2 bg-gray-50 p-6 md:p-8 flex flex-col items-center justify-center pt-20 md:pt-16">

            <div className="w-full aspect-square flex items-center justify-center mb-6 relative">

              <img

                src={currentImage}

                alt={product.name}

                className="max-w-full max-h-full object-contain mix-blend-multiply transition-all duration-300 drop-shadow-lg"

              />

            </div>

            {/* Thumbnails */}

            <div className="flex gap-3 overflow-x-auto w-full justify-center py-2 px-4 no-scrollbar snap-x snap-mandatory">

              {gallery.map((img, idx) => (

                <img

                  key={idx}

                  src={img}

                  onClick={() => setCurrentImage(img)}

                  className={`w-16 h-16 object-contain border rounded-md p-1 cursor-pointer transition snap-center shrink-0 ${currentImage === img ? 'border-black' : 'border-gray-200 hover:border-gray-400'}`}

                />

              ))}

            </div>

          </div>



          {/* Right: Info */}

          <div className="md:w-1/2 p-6 md:p-14 flex flex-col bg-white">

            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 capitalize">

              {product.category}

            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 leading-tight">

              {product.name}

            </h2>



            <div className="flex items-center gap-2 mb-6">

              <div className="flex text-apple-red text-sm">

                {Array.from({ length: 5 }, (_, i) => (

                  <i

                    key={i}

                    className={`fa-solid fa-star ${i < product.stars ? 'text-[#ff3b30]' : 'text-gray-200'}`}

                  ></i>

                ))}

              </div>

              <span className="text-xs text-gray-400">(Avis Clients)</span>

              {product.inStock ? (

                <span className="ml-auto text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700">

                  En Stock

                </span>

              ) : (

                <span className="ml-auto text-xs font-bold px-2 py-1 rounded bg-orange-100 text-orange-600">

                  Rupture

                </span>

              )}

            </div>



            {/* Desktop Price Section */}

            <div className="mb-8 pb-8 border-b border-gray-100 hidden md:block">

              <div className="flex items-baseline gap-3 mb-2">

                <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">

                  Achat:

                </span>

                <span className="text-3xl font-bold text-green-600">

                  {product.price} {siteConfig.currency}

                </span>

                {product.oldPrice && (

                  <span className="text-lg text-gray-400 line-through">

                    {product.oldPrice} {siteConfig.currency}

                  </span>

                )}

                {discount > 0 && (

                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded">

                    -{discount}%

                  </span>

                )}

              </div>



              {product.rentPrice && product.rentPrice > 0 && (

                <div className="flex items-baseline gap-3 mb-4">

                  <span className="text-xs text-blue-500 uppercase tracking-wider font-bold">

                    Location:

                  </span>

                  <span className="text-xl font-bold text-blue-600">

                    {product.rentPrice} {siteConfig.currency}

                  </span>

                  <span className="text-xs text-gray-500">/ jour</span>

                </div>

              )}



              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={!product.inStock}
                  className="flex-1 px-6 py-4 bg-gray-100 text-black font-bold rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-plus"></i>{' '}
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
                  className={`flex-1 px-6 py-4 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 ${product.inStock ? 'bg-black hover:bg-gray-800' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {product.inStock ? 'Acheter' : 'Réserver'}{' '}
                  <i className="fa-solid fa-arrow-right ml-2 text-xs"></i>
                </button>
                {videoUrl && (
                  <button
                    onClick={() => setActiveTab('video')}
                    className="px-6 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-play"></i> Play Video
                  </button>
                )}
              </div>

              {product.rentPrice && product.rentPrice > 0 && (

                <button

                  onClick={openRentWhatsapp}

                  className="w-full mt-3 px-6 py-3 border-2 border-blue-500 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"

                >

                  <i className="fa-regular fa-calendar-check"></i> Louer sur

                  WhatsApp

                </button>

              )}

            </div>



            {/* Tabs */}

            <div className="flex gap-8 border-b border-gray-100 mb-6 sticky top-0 bg-white z-10 pt-2">

              <button

                onClick={() => setActiveTab('desc')}

                className={`pb-2 text-sm font-medium transition ${activeTab === 'desc' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}

              >

                Description

              </button>

              <button

                onClick={() => setActiveTab('specs')}

                className={`pb-2 text-sm font-medium transition ${activeTab === 'specs' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}

              >

                Spécifications

              </button>

              {videoUrl && (

                <button

                  onClick={() => setActiveTab('video')}

                  className={`pb-2 text-sm font-medium transition ${activeTab === 'video' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}

                >

                  Vidéo

                </button>

              )}

            </div>



            <div className="text-gray-600 text-sm leading-relaxed pb-4 text-justify flex-grow overflow-y-auto">

              {activeTab === 'desc' && (

                <p

                  dangerouslySetInnerHTML={{

                    __html: product.desc.replace(/\n/g, '<br>'),

                  }}

                ></p>

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

                              <td className="font-bold bg-gray-50 border-b border-gray-100 p-2 align-top w-1/3">

                                {parts[0].trim()}

                              </td>

                              <td className="border-b border-gray-100 p-2 align-top">

                                {parts.slice(1).join(':').trim()}

                              </td>

                            </>

                          ) : (

                            <td

                              colSpan={2}

                              className="border-b border-gray-100 p-2"

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

          <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50 flex flex-col gap-2">

            <div className="flex justify-between items-center w-full">

              <div className="flex flex-col">

                <div className="flex items-center gap-2">

                  <span className="text-xl font-bold text-green-600 leading-tight">

                    {product.price} {siteConfig.currency}

                  </span>

                  {discount > 0 && (

                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded">

                      -{discount}%

                    </span>

                  )}

                </div>

                {product.oldPrice && (

                  <span className="text-xs text-gray-400 line-through">

                    {product.oldPrice} {siteConfig.currency}

                  </span>

                )}

              </div>

              {product.rentPrice && product.rentPrice > 0 && (

                <div className="text-right">

                  <span className="text-sm font-bold text-blue-600">

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
                className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-black hover:bg-gray-200 disabled:opacity-50"
              >
                <i className="fa-solid fa-plus"></i>
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
                className={`flex-1 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg ${product.inStock ? 'bg-black text-white' : 'bg-orange-500 text-white'}`}
              >
                {product.inStock ? 'Acheter' : 'Réserver'}
              </button>
              {videoUrl && (
                <button
                  onClick={() => setActiveTab('video')}
                  className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center"
                >
                  <i className="fa-solid fa-play"></i>
                </button>
              )}
            </div>

            {product.rentPrice && product.rentPrice > 0 && (

              <button

                onClick={openRentWhatsapp}

                className="w-full h-10 border border-blue-500 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm"

              >

                <i className="fa-regular fa-calendar-check mr-2"></i> Louer

              </button>

            )}

          </div>

        </div>

      </div>

    </div>

  );

};



export default ProductDetailModal;
