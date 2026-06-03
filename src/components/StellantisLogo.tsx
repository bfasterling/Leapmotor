import React from 'react';

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

  // Symmetrical constellation stars/dots orbiting the 'A'
  // Center of constellation coordinates in the SVG viewBox (360 x 80)
  // With standard font-spacing, 'A' in "STELLANTIS" is slightly to the right of absolute center.
  // We place the constellation center around CX=188, CY=40.
  const cx = 188;
  const cy = 41;

  // Generate dots concentric circles representation
  const innerDots = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 360) / 12;
    const rad = (angle * Math.PI) / 180;
    const r = 13.5; // Radius of inner orbit
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
      size: 1.2
    };
  });

  const outerDots = Array.from({ length: 18 }).map((_, i) => {
    const angle = (i * 360) / 18 + 10; // offset slightly for nice visual rhythm
    const rad = (angle * Math.PI) / 180;
    const r = 22.5; // Radius of outer orbit
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
      size: i % 2 === 0 ? 1.0 : 1.4 // alternating dot sizing for organic premium twinkle
    };
  });

  return (
    <div 
      className={`inline-flex items-center justify-center select-none ${selectedHeight} ${className}`} 
      style={{ aspectRatio: '4.8 / 1', ...style }}
      id="stellantis-vector-logo"
    >
      <svg 
        viewBox="0 0 360 80" 
        width="100%" 
        height="100%" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Constellation dots in the background */}
        <g opacity="0.95">
          {innerDots.map((dot, idx) => (
            <circle
              key={`inner-${idx}`}
              cx={dot.x.toFixed(2)}
              cy={dot.y.toFixed(2)}
              r={dot.size}
              fill={color}
              className="animate-pulse"
              style={{ animationDelay: `${idx * 150}ms`, animationDuration: '3s' }}
            />
          ))}
          {outerDots.map((dot, idx) => (
            <circle
              key={`outer-${idx}`}
              cx={dot.x.toFixed(2)}
              cy={dot.y.toFixed(2)}
              r={dot.size}
              fill={color}
              className="animate-pulse"
              style={{ animationDelay: `${(idx * 100) + 400}ms`, animationDuration: '4s' }}
            />
          ))}
        </g>

        {/* Wordmark tracking-widest with thin geometric styling */}
        <text
          x="180"
          y="49"
          textAnchor="middle"
          fill={color}
          fontSize="26"
          fontWeight="300"
          letterSpacing="0.28em"
          fontFamily='"Inter", system-ui, -apple-system, sans-serif'
          className="select-none"
        >
          STELLANTIS
        </text>
      </svg>
    </div>
  );
}
