import React from 'react';

interface LogoProps {
  theme?: 'light' | 'dark';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ theme = 'light', className = '' }) => {
  const isDark = theme === 'dark';
  const textMain = isDark ? '#ffffff' : '#111827';
  const textSub = isDark ? '#9ca3af' : '#6b7280';
  const iconRing = isDark ? '#4b5563' : '#d1d5db';
  const brandRed = '#c53030';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} aria-label="GearShop Maroc">
      <svg
        viewBox="0 0 320 80"
        className="h-10 md:h-12 w-auto"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        {/* Cine Aperture Icon */}
        <g transform="translate(4, 4)">
          {/* Outer focus gear ring */}
          <circle cx="36" cy="36" r="32" stroke={iconRing} strokeWidth="2.5" strokeDasharray="3 3" fill="none" />
          <circle cx="36" cy="36" r="27" stroke={textMain} strokeWidth="2" fill="none" opacity="0.9" />

          {/* Cine optical crosshair guides */}
          <path d="M 22 22 L 18 22 L 18 26" stroke={iconRing} strokeWidth="2" fill="none" />
          <path d="M 50 22 L 54 22 L 54 26" stroke={iconRing} strokeWidth="2" fill="none" />
          <path d="M 22 50 L 18 50 L 18 46" stroke={iconRing} strokeWidth="2" fill="none" />
          <path d="M 50 50 L 54 50 L 54 46" stroke={iconRing} strokeWidth="2" fill="none" />

          {/* Central Stylized 'G' Lens Glass Element */}
          <path
            d="M 48 25 A 15 15 0 1 0 51 47 L 36 47 L 36 37 L 41 37"
            fill="none"
            stroke={textMain}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Tally Recording Dot */}
          <circle cx="44" cy="37" r="3.5" fill={brandRed} />
        </g>

        {/* Typography Block */}
        <g transform="translate(85, 46)">
          {/* Main Title: GEAR SHOP */}
          <text
            x="0"
            y="0"
            fontSize="34"
            fontFamily="system-ui, -apple-system, 'Inter', sans-serif"
            fontWeight="900"
            fill={textMain}
            letterSpacing="-0.5"
          >
            GEAR
          </text>
          <text
            x="96"
            y="0"
            fontSize="34"
            fontFamily="system-ui, -apple-system, 'Inter', sans-serif"
            fontWeight="400"
            fill={textMain}
            letterSpacing="0.5"
          >
            SHOP
          </text>

          {/* Subtitle Line: MAROC • CINE / DISTRIBUTION */}
          <text
            x="2"
            y="20"
            fontSize="10.5"
            fontFamily="system-ui, -apple-system, 'Inter', sans-serif"
            fontWeight="900"
            fill={textSub}
            letterSpacing="4"
          >
            MAROC
          </text>
          <text
            x="76"
            y="20"
            fontSize="8.5"
            fontFamily="system-ui, -apple-system, 'Inter', sans-serif"
            fontWeight="800"
            fill={brandRed}
            letterSpacing="1.5"
          >
            CINE / DISTRIBUTION
          </text>
        </g>
      </svg>
    </div>
  );
};

export default Logo;
