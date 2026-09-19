import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface HeroProps {
  siteConfig?: {
    heroImg?: string;
    hero1?: string;
    hero2?: string;
    heroDesc?: string;
    btnText?: string;
    phone?: string;
  };
  onSelectCategory?: (category: string) => void;
  onSelectBrand?: (brand: string) => void;
}

const bhSlides = [
  {
    id: 'nikon-zr',
    tag: 'JUST ANNOUNCED',
    brandLogo: 'NIKON',
    title: 'Nikon ZR & Série Z',
    subtitle: 'High-end, full-frame performance in an easy-carry hybrid camera',
    desc: 'Capteur plein format ultra-sensible, vidéo 4K/60p 10-bit & monture Z professionnelle.',
    bgImg: '/images/banners/banner_nikon.webp',
    cameraImg: '/images/products/nikon-zr.webp',
    learnMoreLink: '/product/5099-nikon-zr',
    orderLink: '/product/5099-nikon-zr',
    badgeColor: 'bg-red-600',
    accent: '#ff0000'
  },
  {
    id: 'sony-fx3',
    tag: 'JUST ANNOUNCED',
    brandLogo: 'SONY',
    title: 'Sony Cinema FX3 & FX30 / A7 IV',
    subtitle: 'Full-frame 4K 10-Bit video reference with S-Cinetone & dual native ISO',
    desc: 'La caméra de cinéma compacte référence des directeurs photo et créateurs pro au Maroc.',
    bgImg: '/images/banners/banner_nikon.webp',
    cameraImg: '/images/products/sony-cinema-line-fx3.webp',
    learnMoreLink: '/product/5120-sony-cinema-line-fx3',
    orderLink: '/product/5120-sony-cinema-line-fx3',
    badgeColor: 'bg-blue-600',
    accent: '#0066cc'
  },
  {
    id: 'canon-r5m2',
    tag: 'JUST ANNOUNCED',
    brandLogo: 'CANON',
    title: 'Canon EOS R5 Mark II & Gamme RF',
    subtitle: 'High-speed 45MP back-illuminated sensor with 8K RAW & Eye Control AF',
    desc: 'Performance hybride ultime avec stabilisation intégrée 8.5 stops et monture RF.',
    bgImg: '/images/banners/banner_nikon.webp',
    cameraImg: '/images/products/canon-eos-r5-mark-ii.webp',
    learnMoreLink: '/product/6004-canon-eos-r5-mark-ii',
    orderLink: '/product/6004-canon-eos-r5-mark-ii',
    badgeColor: 'bg-red-600',
    accent: '#cc0000'
  },
  {
    id: 'dji-godox',
    tag: 'PRO CREATOR SETUP',
    brandLogo: 'DJI & GODOX',
    title: 'DJI Osmo Pocket 3 & Godox Studio',
    subtitle: 'Complete 4K 120p gimbal stabilization & continuous studio LED lighting',
    desc: 'Tout le matériel professionnel pour équiper vos tournages, podcasts et studios au Maroc.',
    bgImg: '/images/banners/banner_nikon.webp',
    cameraImg: '/images/products/dji-osmo-pocket-3-creator-combo.webp',
    learnMoreLink: '/product/6024-dji-osmo-pocket-3-creator-combo',
    orderLink: '/product/6024-dji-osmo-pocket-3-creator-combo',
    badgeColor: 'bg-emerald-600',
    accent: '#059669'
  }
];

const categoryIcons = [
  { id: 'Appareils Photo', name: 'Appareils Photo', icon: 'fa-camera', sub: 'Hybrides & Reflex', img: '/images/products/nikon-zr.webp' },
  { id: 'Objectifs Photo', name: 'Objectifs Photo', icon: 'fa-circle-dot', sub: 'Sony, Canon, Nikon', img: '/images/products/nikon-nikkor-z-50mm-f-1-8-s.webp' },
  { id: 'cinema', name: 'Caméras Cinéma', icon: 'fa-film', sub: 'Sony FX, Canon EOS C', link: '/cinema-lenses-maroc', img: '/images/products/canon-cinema-eos-c50.webp' },
  { id: 'Éclairage', name: 'Éclairage Studio', icon: 'fa-lightbulb', sub: 'Godox, Softbox, LED', img: '/images/products/ym-350.webp' },
  { id: 'Audio', name: 'Audio Pro', icon: 'fa-microphone', sub: 'Hollyland, Røde, Sans fil', img: '/images/products/hollyland-microphone-sans-fil-lark-a1-combo-usb-c-rx-lightning-rx-charging-case.webp' },
  { id: 'Stabilisateurs', name: 'Drones & Gimbals', icon: 'fa-arrows-to-dot', sub: 'DJI Osmo, RS4 Pro', img: '/images/products/dji-osmo-pocket-3-creator-combo.webp' },
  { id: 'Cages & Rigging', name: 'Rigging & Cages', icon: 'fa-wrench', sub: 'SmallRig, Matte Box', img: '/images/products/smallrig-mini-matte-box-lite.webp' },
  { id: 'Trépieds & Sacs', name: 'Trépieds & Sacs', icon: 'fa-suitcase', sub: 'Vanguard, Filtres K&F', img: '/images/products/vanguard-sac-a-dos-photo-veo-go-42m-noir.webp' },
];

const Hero: React.FC<HeroProps> = ({ siteConfig, onSelectCategory, onSelectBrand }) => {
  const whatsappPhone = (siteConfig?.phone || '212673011873').replace(/[^0-9]/g, '');

  const handleCategoryClick = (cat: typeof categoryIcons[0]) => {
    if (cat.link) {
      window.location.href = cat.link;
    } else if (onSelectCategory) {
      onSelectCategory(cat.id);
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white text-gray-900 pt-3 pb-6" aria-label="B&H Style Megastore Photo & Vidéo Maroc">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* ── 1. B&H Style Framed Notice & Announcement Bar ──────────────── */}
        <div className="mb-4">
          <div className="bg-amber-50/90 border border-amber-300 rounded-lg px-3.5 py-2 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                i
              </span>
              <span>
                <strong>BOUTIQUE EN LIGNE • LIVRAISON 24h-48h PARTOUT AU MAROC :</strong> Dès 500 DH. Expédition rapide le jour même avec paiement sécurisé à la livraison (Cash on Delivery).
              </span>
            </div>
            <a
              href={`https://wa.me/${whatsappPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 underline shrink-0 ml-2"
            >
              <span>Conseil WhatsApp 06 73 01 18 73</span>
              <i className="fa-brands fa-whatsapp text-emerald-600" />
            </a>
          </div>
        </div>

        {/* ── 2. Full-Width Panoramic Widescreen Hero Banner Slider ───────── */}
        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative bg-[#090d16] mb-5">
          <Swiper
            modules={[Autoplay, EffectFade, Pagination, Navigation]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            loop={true}
            pagination={{ clickable: true }}
            navigation={true}
            className="w-full min-h-[360px] sm:min-h-[400px] md:min-h-[460px] hero-bh-swiper"
          >
            {bhSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="relative w-full min-h-[360px] sm:min-h-[400px] md:min-h-[460px] flex items-center overflow-hidden">
                  
                  {/* Background Panoramic Image */}
                  <img
                    src={slide.bgImg}
                    alt={slide.title}
                    width={1920}
                    height={600}
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-screen scale-105"
                    loading="eager"
                  />
                  
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-0" />

                  {/* Slide Content Grid */}
                  <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Left Column: Typography & CTAs */}
                    <div className="md:col-span-7 flex flex-col items-start text-white">
                      
                      {/* Tag & Brand */}
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className={`${slide.badgeColor} text-white text-[11px] font-black px-2.5 py-1 rounded tracking-wider uppercase shadow-md`}>
                          {slide.tag}
                        </span>
                        <span className="text-white font-black tracking-widest text-xs uppercase opacity-90 border-l border-white/20 pl-2.5">
                          {slide.brandLogo}
                        </span>
                      </div>

                      {/* Main Title */}
                      <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2 text-white leading-tight">
                        {slide.title}
                      </h2>

                      {/* Subtitle */}
                      <p className="text-sm sm:text-base md:text-lg font-medium text-gray-200 mb-3 max-w-xl leading-snug">
                        {slide.subtitle}
                      </p>

                      <p className="text-xs sm:text-sm text-gray-400 mb-6 max-w-lg hidden sm:block">
                        {slide.desc}
                      </p>

                      {/* B&H Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          to={slide.learnMoreLink}
                          className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-lg border border-white/30 transition shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white min-h-[44px] flex items-center"
                        >
                          En Savoir Plus
                        </Link>
                        <Link
                          to={slide.orderLink}
                          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition shadow-lg flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 min-h-[44px]"
                        >
                          <span>Commander</span>
                          <i className="fa-solid fa-arrow-right text-xs" />
                        </Link>
                      </div>

                    </div>

                    {/* Right Column: Studio Camera Showcase */}
                    <div className="md:col-span-5 flex items-center justify-center">
                      <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-2xl bg-white/95 p-5 shadow-2xl flex items-center justify-center border border-white/20 relative group">
                        <img
                          src={slide.cameraImg}
                          alt={slide.title}
                          width={288}
                          height={288}
                          className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                          loading="eager"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/products/nikon-zr.webp';
                          }}
                        />
                        <span className="absolute bottom-2.5 right-2.5 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
                          EN STOCK
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* ── 3. Iconic B&H Category Icon Strip (Standardized & Snap Scroll) ── */}
        <nav aria-label="Rayons Principaux" className="border-t border-b border-gray-200 py-3.5 my-1">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5 px-1 flex items-center justify-between">
            <span>Explorer les Rayons Professionnels</span>
            <span className="text-[10px] text-gray-400 font-normal lg:hidden">Faites glisser ↔</span>
          </div>

          <div className="flex overflow-x-auto lg:grid lg:grid-cols-8 gap-2.5 pb-1.5 scrollbar-none snap-x snap-mandatory">
            {categoryIcons.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gray-50 hover:bg-red-50/50 active:scale-[0.98] border border-gray-200/90 hover:border-red-500/50 transition duration-150 group text-center cursor-pointer shadow-2xs hover:shadow-md min-w-[125px] sm:min-w-[140px] lg:min-w-0 flex-1 snap-start min-h-[110px] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                aria-label={`Rayon ${cat.name}`}
              >
                <div className="w-14 h-14 rounded-lg bg-white p-1.5 mb-2 flex items-center justify-center border border-gray-100 group-hover:scale-105 transition duration-150 shadow-2xs shrink-0 overflow-hidden relative">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    width={56}
                    height={56}
                    className="max-w-full max-h-full object-contain aspect-square"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback gracefully to icon if image fails
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent && !parent.querySelector('.fallback-icon')) {
                        const icon = document.createElement('i');
                        icon.className = `fa-solid ${cat.icon} text-gray-400 text-xl fallback-icon`;
                        parent.appendChild(icon);
                      }
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-900 group-hover:text-red-600 transition truncate w-full leading-tight">
                  {cat.name}
                </span>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-700 transition truncate w-full leading-tight mt-0.5">
                  {cat.sub}
                </span>
              </button>
            ))}
          </div>
        </nav>

      </div>
    </section>
  );
};

export default Hero;

