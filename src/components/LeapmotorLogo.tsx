import React from 'react';
import logoPng from '../assets/images/leapmotor_logo_1780268613531.png';

interface LeapmotorLogoProps {
  className?: string; // Standard text color class (preserved for compatibility)
  size?: 'sm' | 'md' | 'lg' | 'auto'; // Horizontal logo size
  showText?: boolean; // If false, renders emblem only
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
}

export default function LeapmotorLogo({ 
  className = '', 
  size = 'md', 
  showText = true,
  style,
  imgStyle
}: LeapmotorLogoProps) {
  // Styles for sizing the container - doubled in size for massive, premium prominence
  const sizeClasses = {
    sm: showText ? 'h-[88px] sm:h-[104px]' : 'h-[88px]',
    md: showText ? 'h-[128px] sm:h-[160px]' : 'h-[128px]',
    lg: showText ? 'h-[208px] sm:h-[256px]' : 'h-[208px]',
    auto: showText ? 'h-[144px] sm:h-[208px]' : 'h-[144px]'
  };

  const selectedSizeClass = sizeClasses[size];

  return (
    <div 
      className={`relative overflow-hidden shrink-0 flex items-center justify-center ${selectedSizeClass} ${className}`} 
      style={{ aspectRatio: showText ? '6.15 / 1' : '1 / 1', ...style }}
      id="leapmotor-composite-logo"
    >
      <img
        src={logoPng}
        alt="Leapmotor Logo"
        referrerPolicy="no-referrer"
        className={`h-full select-none ${
          showText ? 'w-auto object-contain mx-auto' : 'aspect-square object-cover object-center'
        }`}
        style={imgStyle}
      />
    </div>
  );
}
