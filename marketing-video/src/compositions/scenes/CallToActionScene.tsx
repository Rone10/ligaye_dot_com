import React from 'react';
import { useCurrentFrame } from 'remotion';
import { BRAND_COLORS, withOpacity } from '../../utils/colors';
import { CONTENT, TYPOGRAPHY } from '../../utils/constants';
import { useFadeIn, useScaleIn, useSlideUp, usePulse } from '../../utils/animations';

interface CallToActionSceneProps {
  theme: 'light' | 'dark';
  format: 'landscape' | 'square' | 'story';
}

export const CallToActionScene: React.FC<CallToActionSceneProps> = ({ theme, format }) => {
  const frame = useCurrentFrame();
  
  // Animation timings
  const backgroundAnimation = useFadeIn(0, 30);
  const titleAnimation = useSlideUp(30, 45);
  const subtitleAnimation = useSlideUp(60, 45);
  const buttonsAnimation = useScaleIn(90, 45);
  const websiteAnimation = useFadeIn(120, 30);
  const logoScale = usePulse(60);
  
  // Responsive layout
  const isSquare = format === 'square';
  const isStory = format === 'story';
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Dynamic background */}
      <div 
        className="absolute inset-0"
        style={{
          background: BRAND_COLORS.gradients.primary,
          opacity: backgroundAnimation,
        }}
      >
        {/* Animated background elements */}
        <div 
          className="absolute rounded-full blur-3xl"
          style={{
            top: '10%',
            right: '20%',
            width: 400,
            height: 400,
            background: withOpacity('#ffffff', 0.1),
            transform: `scale(${1 + Math.sin(frame * 0.02) * 0.2}) rotate(${frame * 0.5}deg)`,
          }}
        />
        <div 
          className="absolute rounded-full blur-2xl"
          style={{
            bottom: '15%',
            left: '15%',
            width: 300,
            height: 300,
            background: withOpacity('#ffffff', 0.08),
            transform: `scale(${1 + Math.cos(frame * 0.025) * 0.15}) rotate(${-frame * 0.3}deg)`,
          }}
        />
      </div>
      
      <div className={`relative z-10 h-full flex flex-col items-center justify-center ${
        isStory ? 'px-6 py-8' : 'px-12 py-16'
      } text-center`}>
        
        {/* Logo */}
        <div 
          className="mb-8"
          style={{
            opacity: titleAnimation.opacity,
            transform: `scale(${logoScale})`,
          }}
        >
          <div
            className="flex items-center justify-center rounded-2xl shadow-level-3 bg-white/20 backdrop-blur-sm"
            style={{
              width: isStory ? 120 : isSquare ? 140 : 160,
              height: isStory ? 72 : isSquare ? 84 : 96,
            }}
          >
            <span 
              className="text-white font-bold tracking-wider"
              style={{ 
                fontSize: isStory ? 18 : isSquare ? 20 : 24,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              LIGAYE
            </span>
          </div>
        </div>
        
        {/* Main title */}
        <div
          style={{
            opacity: titleAnimation.opacity,
            transform: `translateY(${titleAnimation.translateY}px)`,
          }}
        >
          <h1 
            className="text-white font-bold mb-6"
            style={{ 
              fontSize: isStory ? 32 : isSquare ? 36 : 48,
              lineHeight: 1.1,
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            Ready to Get Started?
          </h1>
        </div>
        
        {/* Subtitle */}
        <div
          style={{
            opacity: subtitleAnimation.opacity,
            transform: `translateY(${subtitleAnimation.translateY}px)`,
            maxWidth: isStory ? '90%' : isSquare ? '85%' : '70%',
          }}
        >
          <p 
            className="text-white/90 mb-8"
            style={{ 
              fontSize: isStory ? 18 : isSquare ? 20 : 24,
              lineHeight: 1.5,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            Join thousands of Gambians finding their perfect career match
          </p>
        </div>
        
        {/* CTA Buttons */}
        <div
          className={`flex ${isStory ? 'flex-col space-y-4' : 'space-x-6'} mb-8`}
          style={{
            opacity: buttonsAnimation.opacity,
            transform: `scale(${buttonsAnimation.scale})`,
          }}
        >
          <button 
            className="px-8 py-4 rounded-xl font-semibold bg-white text-primary-blue shadow-level-3 hover:shadow-level-4 transition-all"
            style={{ 
              fontSize: isStory ? 16 : isSquare ? 18 : 20,
              minWidth: isStory ? 200 : 220,
            }}
          >
            {CONTENT.callToAction.primary}
          </button>
          <button 
            className="px-8 py-4 rounded-xl font-semibold bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all"
            style={{ 
              fontSize: isStory ? 16 : isSquare ? 18 : 20,
              minWidth: isStory ? 200 : 220,
            }}
          >
            {CONTENT.callToAction.secondary}
          </button>
        </div>
        
        {/* Website URL */}
        <div
          style={{
            opacity: websiteAnimation,
          }}
        >
          <p 
            className="text-white/80 font-medium mb-4"
            style={{ 
              fontSize: isStory ? 18 : isSquare ? 20 : 24,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            {CONTENT.callToAction.website}
          </p>
        </div>
        
        {/* Final tagline */}
        <div
          style={{
            opacity: Math.max(0, websiteAnimation - 0.3),
          }}
        >
          <p 
            className="text-white/60 italic"
            style={{ 
              fontSize: isStory ? 14 : isSquare ? 16 : 18,
            }}
          >
            {CONTENT.tagline}
          </p>
        </div>
        
        {/* Animated particles */}
        {frame > 60 && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/40 rounded-full"
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: `${30 + Math.sin((frame + i * 20) * 0.05) * 20}%`,
                  opacity: 0.3 + 0.4 * Math.sin((frame + i * 30) * 0.03),
                  transform: `scale(${0.5 + 0.5 * Math.cos((frame + i * 25) * 0.04)})`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};