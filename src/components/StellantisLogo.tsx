import React from 'react';
import STELLANTIS_LOGO_IMG from '../assets/images/stellantis_logo_black_bg_1780709966624.png';

interface StellantisLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'auto';
  color?: string;
  style?: React.CSSProperties;
}

export default function StellantisLogo({
  className = '',
  size = 'md',
  color = 'currentColor',
  style
}: StellantisLogoProps) {
  // Map design sizes
  const heightClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-9 sm:h-11',
    lg: 'h-14 sm:h-16',
    auto: 'h-full'
  };

  const selectedHeight = heightClasses[size];

  return (
    <div 
      className={`inline-flex items-center justify-center select-none ${selectedHeight} ${className}`} 
      style={style}
      id="stellantis-vector-logo"
    >
      <img
        src={STELLANTIS_LOGO_IMG}
        alt="Stellantis"
        referrerPolicy="no-referrer"
        className="h-full w-auto object-contain max-h-full"
      />
    </div>
  );
}
