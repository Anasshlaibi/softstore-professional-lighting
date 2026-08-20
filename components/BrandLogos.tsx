import React from 'react';

interface BrandLogosProps {
  onBrandSelect?: (brand: string) => void;
}

interface BrandItem {
  name: string;
  category: string;
  tagline: string;
  localLogo?: string;
  svgIcon?: React.ReactNode;
  fallbackText: string;
}

const brands: BrandItem[] = [
  {
    name: '7Artisans',
    category: 'Cinéma & Photo',
    tagline: 'Revendeur Officiel Maroc',
    localLogo: '/logo_7artisans.png',
    fallbackText: '7ARTISANS',
  },
  {
    name: 'K&F Concept',
    category: 'Optique & Filtres',
    tagline: 'Filtres VND, CPL & Bagues',
    fallbackText: 'K&F CONCEPT',
    svgIcon: (
      <svg viewBox="0 0 160 36" className="h-6 w-auto fill-current text-gray-800">
        <text x="0" y="24" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="18" letterSpacing="1">
          K&amp;F <tspan fill="#b91c1c">CONCEPT</tspan>
        </text>
      </svg>
    ),
  },
  {
    name: 'Sony',
    category: 'Boîtiers & Optiques',
    tagline: 'Système E-Mount Plein Format',
    fallbackText: 'SONY',
    svgIcon: (
      <svg viewBox="0 0 100 24" className="h-5 w-auto fill-current text-gray-900">
        <text x="0" y="20" fontFamily="serif" fontWeight="900" fontSize="22" letterSpacing="3">
          SONY
        </text>
      </svg>
    ),
  },
  {
    name: 'Canon',
    category: 'Hybrides & Reflex',
    tagline: 'Systèmes RF & EF',
    fallbackText: 'Canon',
    svgIcon: (
      <svg viewBox="0 0 110 28" className="h-5 w-auto fill-current text-[#c53030]">
        <text x="0" y="22" fontFamily="serif" fontWeight="bold" fontStyle="italic" fontSize="24" letterSpacing="1">
          Canon
        </text>
      </svg>
    ),
  },
  {
    name: 'Nikon',
    category: 'Système Z & Hybride',
    tagline: 'Boîtiers Z & Optiques',
    fallbackText: 'Nikon',
    svgIcon: (
      <svg viewBox="0 0 100 28" className="h-5 w-auto fill-current text-yellow-500">
        <text x="0" y="22" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="22" letterSpacing="2">
          Nikon
        </text>
      </svg>
    ),
  },
  {
    name: 'Godox',
    category: 'Lumière & Studio',
    tagline: 'Éclairage Studio & Flashes',
    fallbackText: 'GODOX',
    svgIcon: (
      <svg viewBox="0 0 100 28" className="h-5 w-auto fill-current text-gray-900">
        <text x="0" y="21" fontFamily="sans-serif" fontWeight="900" fontSize="20" letterSpacing="1">
          G<tspan fill="#ea580c">o</tspan>dox
        </text>
      </svg>
    ),
  },
  {
    name: 'Røde',
    category: 'Audio Professionnel',
    tagline: 'Micros & Transmetteurs Sans Fil',
    fallbackText: 'RØDE',
    svgIcon: (
      <svg viewBox="0 0 100 28" className="h-5 w-auto fill-current text-gray-900">
        <text x="0" y="22" fontFamily="sans-serif" fontWeight="900" fontSize="22" letterSpacing="2">
          RØDE
        </text>
      </svg>
    ),
  },
  {
    name: 'Insta360',
    category: 'Action & 360',
    tagline: 'Caméras VR & Stabilisées',
    fallbackText: 'Insta360',
    svgIcon: (
      <svg viewBox="0 0 120 28" className="h-5 w-auto fill-current text-yellow-500">
        <text x="0" y="22" fontFamily="sans-serif" fontWeight="800" fontSize="19" letterSpacing="0.5">
          insta<tspan fill="#000">360</tspan>
        </text>
      </svg>
    ),
  },
  {
    name: 'SanDisk',
    category: 'Stockage Rapide',
    tagline: 'Cartes SD Extreme Pro & CFE',
    fallbackText: 'SanDisk',
    svgIcon: (
      <svg viewBox="0 0 110 28" className="h-5 w-auto fill-current text-[#c53030]">
        <text x="0" y="22" fontFamily="sans-serif" fontWeight="900" fontSize="20" letterSpacing="1">
          SanDisk
        </text>
      </svg>
    ),
  },
  {
    name: 'Yongnuo',
    category: 'LED & Accessoires',
    tagline: 'Panneaux & Tubes RVB',
    fallbackText: 'YONGNUO',
    svgIcon: (
      <svg viewBox="0 0 130 28" className="h-5 w-auto fill-current text-gray-900">
        <text x="0" y="22" fontFamily="sans-serif" fontWeight="900" fontSize="19" letterSpacing="1.5">
          YONGNUO
        </text>
      </svg>
    ),
  },
];

const BrandLogos: React.FC<BrandLogosProps> = ({ onBrandSelect }) => {
  const handleClick = (brandName: string) => {
    if (onBrandSelect) {
      onBrandSelect(brandName);
    } else {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-14 bg-white border-t border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 mb-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b91c1c] mb-1.5">
              PARTENAIRES &amp; ÉCOSYSTÈME PRO
            </p>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              Les Marques de Référence de la Création Audiovisuelle
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-2 md:mt-0 font-medium">
            Premier importateur officiel d'optiques cinéma au Maroc • Matériel garanti
          </p>
        </div>
      </div>

      {/* Interactive Brand Grid spanning left to right */}
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {brands.map((brand) => (
            <button
              key={brand.name}
              onClick={() => handleClick(brand.name)}
              className="flex flex-col justify-between p-4 h-28 bg-gray-50/60 hover:bg-white border border-gray-200/70 hover:border-red-400 hover:shadow-md rounded-2xl transition-all duration-300 group text-left cursor-pointer"
            >
              {/* Top brand logo or SVG */}
              <div className="h-9 flex items-center justify-start w-full">
                {brand.localLogo ? (
                  <img
                    src={brand.localLogo}
                    alt={brand.name}
                    className="max-h-8 max-w-[100px] object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                ) : brand.svgIcon ? (
                  <div className="group-hover:scale-105 transition-transform duration-300">
                    {brand.svgIcon}
                  </div>
                ) : (
                  <span className="text-sm font-black tracking-wider text-gray-900 group-hover:text-red-700 transition-colors">
                    {brand.fallbackText}
                  </span>
                )}
              </div>

              {/* Bottom text: category & tagline */}
              <div className="mt-1 pt-1.5 border-t border-gray-200/40 w-full flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-gray-800 group-hover:text-red-700 block transition-colors leading-none">
                    {brand.name}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium block mt-0.5 truncate">
                    {brand.tagline}
                  </span>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-gray-300 group-hover:text-red-600 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogos;
