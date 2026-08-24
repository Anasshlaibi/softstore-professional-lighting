import React from 'react';

interface LogoProps {
  theme?: 'light' | 'dark';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ theme = 'light', className = '' }) => {
  return (
    <div className={`flex items-center select-none ${className}`} aria-label="GearShop Maroc">
      <img
        src="/logo_gearshop.png"
        alt="GearShop Maroc - Objectifs 7Artisans, Lentilles Cinéma & Accessoires"
        className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
        loading="eager"
      />
    </div>
  );
};

export default Logo;
