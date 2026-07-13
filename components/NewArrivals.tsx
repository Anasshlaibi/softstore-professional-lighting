import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Product } from '../App'; // adjust path if needed

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface NewArrivalsProps {
  products: Product[];
  siteConfig?: any;
}

const NewArrivals: React.FC<NewArrivalsProps> = ({ products, siteConfig }) => {
  const slides = useMemo(() => {
    if (!products) return [];
    const invoiceIds = [1027, 1002, 1004, 1035, 1021, 1019, 1018, 1030, 1015, 1023, 1043, 1060, 1061, 1062];
    // Filter the products that are in the invoice list
    return products
      .filter(p => invoiceIds.includes(p.id))
      .slice(0, 5) // Show top 5 in carousel to not overwhelm
      .map(p => ({
        id: p.id,
        name: p.name,
        label: 'AVAILABLE NOW',
        desc: p.desc || 'Découvrez ce nouveau produit exceptionnel.',
        features: ['In Stock', p.category || 'Accessory', 'Ready to Ship'],
        image: p.image || 'https://images.unsplash.com/photo-1502982720700-bfff97f2ec04?auto=format&fit=crop&q=80&w=800',
      }));
  }, [products]);

  if (slides.length === 0) return null;

  return (
    <section className="py-24" style={{ backgroundColor: '#050505' }}>
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 w-full">
            <h2 className="text-2xl font-semibold tracking-wide uppercase text-white/90">
              New Arrivals
            </h2>
            <div className="flex-grow h-px bg-white/10"></div>
          </div>
          
          {/* Custom Navigation */}
          <div className="flex gap-4 z-10 shrink-0">
            <button className="swiper-button-prev-custom w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 text-white bg-transparent hover:bg-white/10">
              <i className="fa-solid fa-chevron-left text-sm"></i>
            </button>
            <button className="swiper-button-next-custom w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 text-white bg-transparent hover:bg-white/10">
              <i className="fa-solid fa-chevron-right text-sm"></i>
            </button>
          </div>
        </header>

        {/* Carousel Container */}
        <div 
          className="relative overflow-hidden" 
          style={{ 
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}
        >
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
            }}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{ 
              clickable: true,
              el: '.swiper-pagination-custom',
              bulletClass: 'swiper-custom-editorial-bullet',
              bulletActiveClass: 'swiper-custom-editorial-bullet-active',
            }}
            className="w-full h-full group"
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.id}>
                {/* Changed to standard sliding effect, solid background prevents text overlapping bugs */}
                <div className="flex flex-col lg:flex-row items-stretch min-h-[500px] bg-gradient-to-br from-[#0a0a0a] to-[#111111]">
                  
                  {/* Left: Image Container */}
                  <div className="w-full lg:w-1/2 relative flex justify-center items-center p-12 overflow-hidden bg-white/5 backdrop-blur-sm">
                    <img 
                      src={slide.image} 
                      alt={slide.name} 
                      className="w-full max-w-[400px] h-auto object-contain transform group-hover:scale-105 transition-transform duration-700 ease-out drop-shadow-2xl"
                    />
                  </div>

                  {/* Right: Content Container */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-center p-10 lg:p-16">
                    <span 
                      className="text-xs font-semibold tracking-widest mb-4 uppercase text-gray-400" 
                    >
                      {slide.label}
                    </span>
                    
                    <h3 
                      className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight text-white" 
                    >
                      {slide.name}
                    </h3>
                    
                    <p 
                      className="text-lg mb-8 leading-relaxed font-light text-gray-400"
                    >
                      {slide.desc}
                    </p>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-3 mb-10">
                      {slide.features.map((feature, i) => (
                        <span 
                          key={i} 
                          className="px-4 py-1.5 text-xs font-medium tracking-wide rounded-full bg-white/5 border border-white/10 text-gray-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* CTAs */}
                    <div className="flex items-center gap-6 mt-auto">
                      <button 
                        className="px-8 py-3.5 font-medium text-sm tracking-wide transition-all duration-300 rounded-full bg-white text-black hover:bg-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        Explore Product
                      </button>
                      <button 
                        className="text-sm font-medium tracking-wide transition-colors duration-300 text-gray-400 hover:text-white flex items-center"
                      >
                        Learn More <i className="fa-solid fa-arrow-right ml-2 text-xs transition-transform group-hover:translate-x-1"></i>
                      </button>
                    </div>
                  </div>
                  
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Custom Editorial Pagination */}
          <div className="swiper-pagination-custom absolute bottom-8 right-12 z-20 flex gap-2"></div>
        </div>
      </div>
      
      <style>{`
        .swiper-custom-editorial-bullet {
          width: 6px;
          height: 6px;
          background: rgba(255,255,255,0.3);
          border-radius: 50%;
          display: inline-block;
          cursor: pointer;
          transition: all 0.4s ease;
        }
        .swiper-custom-editorial-bullet-active {
          background: rgba(255,255,255,0.9);
          transform: scale(1.5);
          border-radius: 4px;
        }
      `}</style>
    </section>
  );
};

export default NewArrivals;
