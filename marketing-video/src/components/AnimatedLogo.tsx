import React from 'react';
import { useCurrentFrame } from 'remotion';
import { BRAND_COLORS } from '../utils/colors';
import { useRotate, usePulse } from '../utils/animations';


// hello
interface AnimatedLogoProps {
  size?: number;
  showPulse?: boolean;
  rotationSpeed?: number;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ 
  size = 120, 
  showPulse = false,
  rotationSpeed = 0.5 
}) => {
  const frame = useCurrentFrame();
  const rotation = useRotate(0, 3600, 1); // Full rotation over 2 minutes
  const pulseScale = usePulse(60);
  
  const scale = showPulse ? pulseScale : 1;
  
  return (
    <div
      className="flex items-center justify-center rounded-2xl shadow-level-3"
      style={{
        width: size,
        height: size * 0.6,
        background: BRAND_COLORS.gradients.primary,
        transform: `scale(${scale}) rotate(${rotation * rotationSpeed}deg)`,
      }}
    >
      <span 
        className="text-white font-bold tracking-wider"
        style={{ 
          fontSize: size * 0.15,
          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}
      >
        LIGAYE
      </span>
    </div>
  );
};