import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';

interface HeroProps {
  siteConfig: {
    heroImg?: string;
    hero1?: string;
    hero2?: string;
    heroDesc?: string;
    btnText?: string;
  };
}

// Each hero image needs descriptive, keyword-rich alt text for Google Image Search
const heroImages = [
  {
    src: '/AF135_2-2.webp',
    alt: 'Objectif 7Artisans AF135mm F1.8 - Lentille autofocus plein format disponible au Maroc chez GearShop',
    title: 'Objectif 7Artisans AF135mm F1.8 Nikon Z - GearShop Maroc'
  },
  {
    src: '/cine_lens.jpg',
    alt: 'Lentilles cinéma 7Artisans T2.0 - Cine Lens disponibles au Maroc pour Canon, Nikon Z et Sony E',
    title: 'Lentilles Cinéma 7Artisans - GearShop Casablanca'
  },
  {
    src: '/photo_lens.jpg',
    alt: 'Objectifs photo 7Artisans pour appareil Canon, Nikon et Sony - Seul revendeur au Maroc',
    title: 'Objectifs Photo 7Artisans Maroc - GearShop'
  },
];

const Hero: React.FC<HeroProps> = () => {
  return (
    <section
      className="relative h-[100dvh] min-h-[600px] flex items-end justify-center overflow-hidden bg-[#0A0A0A]"
      aria-label="Objectifs 7Artisans et Lentilles Cinéma au Maroc - GearShop"
    >
      
      <div className="absolute inset-0 z-0 w-full h-full">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          allowTouchMove={false}
          className="w-full h-full"
        >
          {heroImages.map((img, index) => (
            <SwiperSlide key={index}>
              <img
                src={img.src}
                alt={img.alt}
                title={img.title}
                className="w-full h-full object-cover object-center scale-105"
                // First image loads eagerly for LCP performance (Google Core Web Vitals)
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                width={1920}
                height={1080}
                style={{
                  animation: 'kenburns 15s ease-out infinite alternate'
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      {/* Very Subtle Dark Overlay for Button Contrast (10-20%) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-0 pointer-events-none"></div>

      {/* Content: Just the buttons, elegant and minimal */}
      <div className="relative z-10 w-full pb-24 md:pb-32 px-6 flex flex-col sm:flex-row gap-6 justify-center items-center">
        {/* Primary CTA */}
        <a
          href="#collection"
          className="w-full sm:w-auto px-10 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all duration-300 text-sm uppercase tracking-widest shadow-lg hover:shadow-white/20 transform hover:-translate-y-1 text-center"
        >
          Explore Collection
        </a>
        
        {/* Secondary Outlined CTA */}
        <a
          href="#videos"
          className="w-full sm:w-auto px-10 py-4 text-white border border-white/50 bg-black/10 backdrop-blur-sm rounded-full hover:bg-white hover:text-black transition-all duration-300 text-sm font-semibold uppercase tracking-widest transform hover:-translate-y-1 text-center"
        >
          Learn More
        </a>
      </div>
    </section>
  );
};

export default Hero;

