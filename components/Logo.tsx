import React, { useEffect, useState } from 'react';
import '../src/styles/logo.css';
import '../src/styles/logo-animation.css';

interface LogoProps {
  theme?: 'light' | 'dark';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ theme = 'light', className = '' }) => {
  const [playAnimation, setPlayAnimation] = useState(false);

  useEffect(() => {
    // Check session storage to prevent animation fatigue on page navigation
    const hasPlayed = sessionStorage.getItem('gearShopLogoPlayed');
    if (!hasPlayed) {
      setPlayAnimation(true);
      sessionStorage.setItem('gearShopLogoPlayed', 'true');
    }
  }, []);

  const themeClass = theme === 'dark' ? 'logo-theme-dark' : 'logo-theme-light';

  return (
    <div className={`logo-wrapper ${themeClass} ${playAnimation ? 'play-logo' : ''} ${className}`}>
      <svg
        className="logo-svg"
        viewBox="0 0 420 120"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="GearShop Maroc Logo"
      >
        <defs>
          {/* Master Blade Profile: Heavy, geometric, premium */}
          <path id="blade" d="M 60,18 L 88,26 L 76,46 L 52,40 Z" fill="var(--icon-main)" />
        </defs>

        {/* Aperture Icon Group */}
        {/* The inner group handles the hover rotation separately from the load animation */}
        <g className="anim-group anim-aperture">
          <g className="icon-rotate">
            {/* Outer Heavy Lens Barrel */}
            <circle cx="60" cy="60" r="46" stroke="var(--icon-main)" strokeWidth="12" fill="none" />

            {/* 6 Perfectly Symmetrical Blades */}
            <use href="#blade" transform="rotate(0 60 60)" />
            <use href="#blade" transform="rotate(60 60 60)" />
            <use href="#blade" transform="rotate(120 60 60)" />
            <use href="#blade" transform="rotate(180 60 60)" />
            <use href="#blade" transform="rotate(240 60 60)" />
            <use href="#blade" transform="rotate(300 60 60)" />

            {/* The "Hidden G" Crossbar (Minimal Red Accent) */}
            <rect className="anim-red-accent" x="62" y="54" width="22" height="12" fill="var(--brand-red)" rx="2" />
          </g>
        </g>

        {/* Typography Group */}
        {/* Using Manrope for a wide, stable, tech-forward stance */}
        <text
          className="anim-group anim-text-1"
          x="140"
          y="72"
          fontSize="52"
          fontFamily="'Manrope', sans-serif"
          fontWeight="800"
          fill="var(--text-main)"
          letterSpacing="-1"
        >
          GEAR
        </text>

        <text
          className="anim-group anim-text-2"
          x="282"
          y="72"
          fontSize="52"
          fontFamily="'Manrope', sans-serif"
          fontWeight="300"
          fill="var(--text-main)"
          letterSpacing="1"
        >
          SHOP
        </text>

        <text
          className="anim-group anim-maroc"
          x="144"
          y="98"
          fontSize="16"
          fontFamily="'Manrope', sans-serif"
          fontWeight="700"
          fill="var(--text-sub)"
          letterSpacing="14"
        >
          MAROC
        </text>
      </svg>
    </div>
  );
};

export default Logo;
