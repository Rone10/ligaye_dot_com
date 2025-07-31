import React from 'react';
import { useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { BRAND_COLORS, withOpacity } from '../../utils/colors';
import { CONTENT, TYPOGRAPHY } from '../../utils/constants';
import { useFadeIn, useScaleIn, useSlideUp } from '../../utils/animations';

interface IntroSceneProps {
  theme: 'light' | 'dark';
  format: 'landscape' | 'square' | 'story';
}

export const IntroScene: React.FC<IntroSceneProps> = ({ theme, format }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // Animation timings
  const logoOpacity = useFadeIn(0, 30);
  const logoScale = useScaleIn(0, 45, 0.8);
  const taglineAnimation = useSlideUp(60, 45, 30);
  const backgroundOpacity = useFadeIn(30, 60);
  
  // Responsive sizing based on format
  const isSquare = format === 'square';
  const isStory = format === 'story';
  
  const logoSize = isStory ? 200 : isSquare ? 250 : 300;
  const titleSize = isStory ? 36 : isSquare ? 42 : TYPOGRAPHY.hero.fontSize;
  const spacing = isStory ? 40 : isSquare ? 50 : 60;
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Animated background elements */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: backgroundOpacity }}
      >
        {/* Decorative circles */}
        <div 
          className="absolute rounded-full blur-3xl"
          style={{
            top: '10%',
            right: '15%',
            width: 300,
            height: 300,
            background: withOpacity(BRAND_COLORS.primary.blue, 0.1),
          }}
        />
        <div 
          className="absolute rounded-full blur-3xl"
          style={{
            bottom: '20%',
            left: '10%',
            width: 200,
            height: 200,
            background: withOpacity(BRAND_COLORS.secondary.green, 0.1),
          }}
        />
      </div>
      
      {/* Logo */}
      <div 
        className="relative z-10 mb-8"
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale.scale})`,
        }}
      >
        {/* Logo placeholder - replace with actual logo */}
        <div
          className="flex items-center justify-center rounded-2xl shadow-level-3"
          style={{
            width: logoSize,
            height: logoSize * 0.6,
            background: BRAND_COLORS.gradients.primary,
          }}
        >
          <span 
            className="text-white font-bold tracking-wider"
            style={{ 
              fontSize: logoSize * 0.15,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            LIGAYE
          </span>
        </div>
      </div>
      
      {/* Company name */}
      <div
        className="relative z-10 text-center mb-4"
        style={{
          opacity: taglineAnimation.opacity,
          transform: `translateY(${taglineAnimation.translateY}px)`,
        }}
      >
        <h1 
          className="font-bold text-gradient mb-2"
          style={{ 
            fontSize: titleSize * 0.7,
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          {CONTENT.companyName}
        </h1>
      </div>
      
      {/* Main tagline */}
      <div
        className="relative z-10 text-center px-8"
        style={{
          opacity: taglineAnimation.opacity,
          transform: `translateY(${taglineAnimation.translateY}px)`,
          maxWidth: isStory ? '90%' : isSquare ? '85%' : '70%',
        }}
      >
        <h2 
          className={`font-semibold ${
            theme === 'dark' ? 'text-theme-light' : 'text-theme-dark'
          }`}
          style={{ 
            fontSize: titleSize,
            lineHeight: 1.2,
            textAlign: 'center',
            textShadow: theme === 'dark' ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 10px rgba(255,255,255,0.8)',
          }}
        >
          {CONTENT.tagline}
        </h2>
      </div>
      
      {/* Subtitle */}
      <div
        className="relative z-10 text-center px-8 mt-6"
        style={{
          opacity: Math.max(0, taglineAnimation.opacity - 0.3),
          transform: `translateY(${taglineAnimation.translateY + 10}px)`,
          maxWidth: isStory ? '90%' : isSquare ? '85%' : '60%',
        }}
      >
        <p 
          className={`${
            theme === 'dark' ? 'text-theme-gray-dark' : 'text-theme-gray-dark'
          }`}
          style={{ 
            fontSize: isStory ? 18 : isSquare ? 20 : TYPOGRAPHY.body.fontSize,
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          Find your dream job or hire top talent in The Gambia
        </p>
      </div>
      
      {/* Animated dots/loading indicator */}
      {frame > 180 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: BRAND_COLORS.primary.blue,
                  opacity: 0.4 + 0.4 * Math.sin((frame - 180 + i * 10) * 0.2),
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};