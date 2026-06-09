import React from 'react';
import logoGreen from '../assets/images/leapmotor_logo_1780268613531.png';
import logoWhite from '../assets/images/regenerated_image_1780979872662.png';
import logoOutline from '../assets/images/regenerated_image_1780979872662.png';

interface LeapmotorLogoProps {
  className?: string; // Standard text color class (preserved for compatibility)
  size?: 'sm' | 'md' | 'lg' | 'auto'; // Horizontal logo size
  showText?: boolean; // If false, renders emblem only
  variant?: 'white' | 'green' | 'outline'; // Logo color variant
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  isCapsule?: boolean; // Premium capsule badge presentation
}

export default function LeapmotorLogo({ 
  className = '', 
  size = 'md', 
  showText = true,
  variant = 'white',
  style,
  imgStyle,
  isCapsule = false
}: LeapmotorLogoProps) {
  // Styles for sizing the container - doubled in size for massive, premium prominence
  const sizeClasses = {
    sm: showText ? 'h-[88px] sm:h-[104px]' : 'h-[88px]',
    md: showText ? 'h-[128px] sm:h-[160px]' : 'h-[128px]',
    lg: showText ? 'h-[208px] sm:h-[256px]' : 'h-[208px]',
    auto: showText ? 'h-[144px] sm:h-[208px]' : 'h-[144px]'
  };

  const selectedSizeClass = sizeClasses[size];
  const logoPng = variant === 'outline' ? logoOutline : (variant === 'white' ? logoWhite : logoGreen);

  // Track if we need to render with white background
  const hasWhiteBackground = isCapsule || style?.backgroundColor === '#ffffff' || style?.backgroundColor === 'white';

  const finalContainerStyle: React.CSSProperties = {
    aspectRatio: showText ? '6.15 / 1' : '1 / 1',
    ...(hasWhiteBackground ? {
      backgroundColor: '#ffffff',
      borderRadius: '9999px',
      padding: '12px 32px',
      boxShadow: '0 10px 30px -5px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.2)',
    } : {}),
    ...style
  };

  const finalImgStyle: React.CSSProperties = {
    ...imgStyle,
    ...(hasWhiteBackground ? {
      mixBlendMode: 'normal',
      filter: 'invert(1) contrast(2) brightness(0.15)' // Crisp black vector look from white PNG
    } : {
      mixBlendMode: 'normal'
    })
  };

  return (
    <div 
      className={`relative overflow-hidden shrink-0 flex items-center justify-center ${selectedSizeClass} ${className}`} 
      style={finalContainerStyle}
      id="leapmotor-composite-logo"
    >
      <img
        src={logoPng}
        alt="Leapmotor Logo"
        referrerPolicy="no-referrer"
        className={`h-full select-none ${
          showText ? 'w-auto object-contain mx-auto' : 'aspect-square object-cover object-center'
        }`}
        style={finalImgStyle}
      />
    </div>
  );
}
