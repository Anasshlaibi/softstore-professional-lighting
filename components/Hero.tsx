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

const Hero: React.FC<HeroProps> = () => {
  // The 3 hero images requested by the user
  const heroImages = [
    '/AF135_2-2.webp',
    '/cine_lens.jpg',
    '/photo_lens.jpg',
  ];

  return (
    <section className="relative h-[100dvh] min-h-[600px] flex items-end justify-center overflow-hidden bg-[#0A0A0A]">
      
      <div className="absolute inset-0 z-0 w-full h-full">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          allowTouchMove={false} // Disable dragging for a purely cinematic background
          className="w-full h-full"
        >
          {heroImages.map((src, index) => (
            <SwiperSlide key={index}>
              <img
                src={src}
                alt={`Featured Product ${index + 1}`}
                className="w-full h-full object-cover object-center scale-105"
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
