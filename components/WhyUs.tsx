import React from 'react';

interface WhyUsProps {
  siteConfig: {
    whyImg: string;
    whyTitle: string;
    whyText: string;
  };
}

const WhyUs: React.FC<WhyUsProps> = ({ siteConfig }) => {
  return (
    <section id="whyus" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
          <div className="md:w-1/2 flex items-center justify-center p-8 h-80 md:h-auto">
            <img
              src={siteConfig.whyImg}
              loading="lazy"
              alt="SoftStore product in action"
              className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {siteConfig.whyTitle}
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {siteConfig.whyText}
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="border-l-2 border-black pl-4">
                <span className="block text-2xl font-bold text-black">
                  2019
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  Fondation
                </span>
              </div>
              <div className="border-l-2 border-black pl-4">
                <span className="block text-2xl font-bold text-black">50+</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  Pays
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
