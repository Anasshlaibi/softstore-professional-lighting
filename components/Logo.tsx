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
    const hasPlayed = sessionStorage.getItem('cineLogoPlayed');
    if (!hasPlayed) {
      setPlayAnimation(true);
      sessionStorage.setItem('cineLogoPlayed', 'true');
    }
  }, []);

  const themeClass = theme === 'dark' ? 'logo-theme-dark' : 'logo-theme-light';

  return (
    <div className={`logo-wrapper ${themeClass} ${playAnimation ? 'play-logo' : ''} ${className}`} aria-label="GearShop Maroc logo">
      <svg
        className="logo-svg"
        viewBox="0 0 460 120"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <g className="cine-gear">
          <circle className="anim-gear-draw" cx="50" cy="50" r="46" stroke="var(--icon-dim)" strokeWidth="4" strokeDasharray="3 4" fill="none" />
          <circle className="anim-gear-draw" cx="50" cy="50" r="41" stroke="var(--icon-main)" strokeWidth="2" fill="none" style={{ animationDelay: '0.2s' }} />

          <g className="anim-guides" stroke="var(--icon-dim)" strokeWidth="2" fill="none">
            <path d="M 32 28 L 26 28 L 26 34" />
            <path d="M 68 28 L 74 28 L 74 34" />
            <path d="M 32 72 L 26 72 L 26 66" />
            <path d="M 68 72 L 74 72 L 74 66" />
          </g>

          <path className="anim-glass-g" d="M 66 32 A 22 22 0 1 0 70 64 L 50 64 L 50 50 L 56 50" fill="none" stroke="var(--icon-main)" strokeWidth="6" strokeLinecap="square" />

          <circle className="anim-tally-light" cx="60" cy="50" r="4" fill="var(--brand-red)" />
        </g>

        <g transform="translate(125, 65)">
          <text className="anim-text" x="0" y="0" fontSize="52" fontFamily="'Manrope', sans-serif" fontWeight="800" fill="var(--text-main)" letterSpacing="-1">
            GEAR
          </text>

          <text className="anim-text" x="145" y="0" fontSize="52" fontFamily="'Manrope', sans-serif" fontWeight="300" fill="var(--text-main)" letterSpacing="1" style={{ animationDelay: '1.3s' }}>
            SHOP
          </text>

          <text className="anim-text" x="5" y="28" fontSize="14" fontFamily="'Manrope', sans-serif" fontWeight="800" fill="var(--text-sub)" letterSpacing="14" style={{ animationDelay: '1.4s' }}>
            MAROC
          </text>

          <text className="anim-text" x="148" y="28" fontSize="10" fontFamily="'Manrope', sans-serif" fontWeight="600" fill="var(--brand-red)" letterSpacing="3" style={{ animationDelay: '1.5s' }}>
            CINE / DISTRIBUTION
          </text>
        </g>
      </svg>
    </div>
  );
};

export default Logo;
