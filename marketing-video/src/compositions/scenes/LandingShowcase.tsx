import React from 'react';
import { useCurrentFrame } from 'remotion';
import { BRAND_COLORS, withOpacity } from '../../utils/colors';
import { CONTENT, TYPOGRAPHY } from '../../utils/constants';
import { useFadeIn, useSlideInLeft, useSlideInRight, useStaggerAnimation } from '../../utils/animations';

interface LandingShowcaseProps {
  theme: 'light' | 'dark';
  format: 'landscape' | 'square' | 'story';
}

export const LandingShowcase: React.FC<LandingShowcaseProps> = ({ theme, format }) => {
  const frame = useCurrentFrame();
  
  // Animation timings
  const titleAnimation = useSlideInLeft(0, 45);
  const heroTextAnimation = useSlideInRight(30, 45);
  const featureAnimations = useStaggerAnimation(60, 4, 15, 30);
  const backgroundOpacity = useFadeIn(0, 30);
  
  // Responsive layout
  const isSquare = format === 'square';
  const isStory = format === 'story';
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background with subtle animation */}
      <div 
        className={`absolute inset-0 ${theme === 'dark' ? 'gradient-bg-dark' : 'gradient-bg'}`}
        style={{ opacity: backgroundOpacity }}
      >
        {/* Decorative elements */}
        <div 
          className="absolute rounded-full blur-3xl"
          style={{
            top: '5%',
            right: '10%',
            width: 400,
            height: 400,
            background: withOpacity(BRAND_COLORS.primary.blue, 0.05),
            transform: `translateX(${Math.sin(frame * 0.02) * 20}px)`,
          }}
        />
        <div 
          className="absolute rounded-full blur-2xl"
          style={{
            bottom: '10%',
            left: '5%',
            width: 300,
            height: 300,
            background: withOpacity(BRAND_COLORS.secondary.green, 0.05),
            transform: `translateX(${Math.cos(frame * 0.025) * 15}px)`,
          }}
        />
      </div>
      
      <div className={`relative z-10 h-full ${isStory ? 'px-6 py-8' : 'px-12 py-16'}`}>
        <div className={`h-full flex ${isStory ? 'flex-col' : isSquare ? 'flex-col' : 'items-center'}`}>
          {/* Left side - Text content */}
          <div className={`${isStory ? 'w-full' : isSquare ? 'w-full text-center' : 'w-1/2 pr-12'}`}>
            {/* Main title */}
            <div style={{
              opacity: titleAnimation.opacity,
              transform: `translateX(${titleAnimation.translateX}px)`,
            }}>
              <h1 
                className={`font-bold mb-6 ${theme === 'dark' ? 'text-theme-light' : 'text-theme-dark'}`}
                style={{ 
                  fontSize: isStory ? 36 : isSquare ? 42 : 56,
                  lineHeight: 1.1,
                }}
              >
                <span className="text-gradient">Gambia's</span> Digital Career
                <br />
                <span className="text-gradient">Revolution</span>
              </h1>
            </div>
            
            {/* Hero description */}
            <div style={{
              opacity: heroTextAnimation.opacity,
              transform: `translateX(${heroTextAnimation.translateX}px)`,
            }}>
              <p 
                className={`mb-8 ${theme === 'dark' ? 'text-theme-gray-dark' : 'text-theme-gray-dark'}`}
                style={{ 
                  fontSize: isStory ? 18 : isSquare ? 20 : 24,
                  lineHeight: 1.5,
                  maxWidth: isSquare ? '100%' : 600,
                }}
              >
                Find your dream job or hire top talent in The Gambia. Connect with opportunities that match your skills and ambitions.
              </p>
            </div>
            
            {/* Key features list */}
            <div className="space-y-4">
              {CONTENT.features.jobSeekers.slice(0, 3).map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center"
                  style={{
                    opacity: featureAnimations[index],
                    transform: `translateX(${(1 - featureAnimations[index]) * -30}px)`,
                  }}
                >
                  <div 
                    className="w-6 h-6 rounded-full mr-4 flex items-center justify-center"
                    style={{ background: BRAND_COLORS.primary.blue }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span 
                    className={`${theme === 'dark' ? 'text-theme-light' : 'text-theme-dark'}`}
                    style={{ fontSize: isStory ? 16 : isSquare ? 18 : 20 }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            
            {/* CTA Buttons */}
            <div className={`mt-8 flex ${isStory ? 'flex-col space-y-4' : 'space-x-4'}`}>
              <button 
                className="px-8 py-4 rounded-xl font-semibold text-white shadow-level-2 hover:shadow-level-3 transition-all"
                style={{ 
                  background: BRAND_COLORS.primary.blue,
                  fontSize: isStory ? 16 : 18,
                  opacity: featureAnimations[3] || 0,
                }}
              >
                Find Jobs
              </button>
              <button 
                className={`px-8 py-4 rounded-xl font-semibold border-2 transition-all ${
                  theme === 'dark' 
                    ? 'text-theme-light border-theme-light' 
                    : 'text-theme-dark border-theme-dark'
                }`}
                style={{ 
                  fontSize: isStory ? 16 : 18,
                  opacity: featureAnimations[3] || 0,
                }}
              >
                Post a Job
              </button>
            </div>
          </div>
          
          {/* Right side - Visual mockup (landscape only) */}
          {!isStory && !isSquare && (
            <div className="w-1/2 flex items-center justify-center">
              <div style={{
                opacity: heroTextAnimation.opacity,
                transform: `translateX(${-heroTextAnimation.translateX}px) scale(${0.8 + heroTextAnimation.opacity * 0.2})`,
              }}>
                {/* Website mockup placeholder */}
                <div 
                  className="glass-card p-6 shadow-level-4"
                  style={{ 
                    width: 500, 
                    height: 350,
                    background: theme === 'dark' ? BRAND_COLORS.glass.dark : BRAND_COLORS.glass.light,
                  }}
                >
                  {/* Mock browser header */}
                  <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                      <div className="w-3 h-3 bg-green-400 rounded-full" />
                    </div>
                    <div className="ml-4 flex-1 text-center">
                      <div className="text-sm text-theme-gray-dark">ligaye.com</div>
                    </div>
                  </div>
                  
                  {/* Mock content */}
                  <div className="space-y-4">
                    <div className="h-8 bg-gradient-to-r from-primary-blue to-secondary-green rounded opacity-80" />
                    <div className="space-y-2">
                      <div className="h-4 bg-theme-gray rounded w-3/4" />
                      <div className="h-4 bg-theme-gray rounded w-1/2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 bg-theme-gray rounded opacity-60" />
                      <div className="h-20 bg-theme-gray rounded opacity-40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};