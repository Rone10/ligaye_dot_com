import React from 'react';
import { useCurrentFrame } from 'remotion';
import { BRAND_COLORS, withOpacity } from '../../utils/colors';
import { CONTENT } from '../../utils/constants';
import { useFadeIn, useSlideInLeft, useSlideInRight, useStaggerAnimation } from '../../utils/animations';

interface FeaturesSceneProps {
  theme: 'light' | 'dark';
  format: 'landscape' | 'square' | 'story';
}

export const FeaturesScene: React.FC<FeaturesSceneProps> = ({ theme, format }) => {
  const frame = useCurrentFrame();
  
  // Animation timings
  const titleAnimation = useFadeIn(0, 30);
  const leftSideAnimation = useSlideInLeft(30, 60);
  const rightSideAnimation = useSlideInRight(45, 60);
  const featureAnimations = useStaggerAnimation(90, 4, 15, 30);
  
  // Responsive layout
  const isSquare = format === 'square';
  const isStory = format === 'story';
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 ${theme === 'dark' ? 'gradient-bg-dark' : 'gradient-bg'}`}>
        {/* Animated background elements */}
        <div 
          className="absolute rounded-full blur-3xl"
          style={{
            top: '20%',
            left: '10%',
            width: 300,
            height: 300,
            background: withOpacity(BRAND_COLORS.primary.blue, 0.08),
            transform: `scale(${1 + Math.sin(frame * 0.03) * 0.1})`,
          }}
        />
        <div 
          className="absolute rounded-full blur-3xl"
          style={{
            bottom: '20%',
            right: '10%',
            width: 250,
            height: 250,
            background: withOpacity(BRAND_COLORS.secondary.green, 0.08),
            transform: `scale(${1 + Math.cos(frame * 0.025) * 0.1})`,
          }}
        />
      </div>
      
      <div className={`relative z-10 h-full ${isStory ? 'px-6 py-8' : 'px-12 py-16'}`}>
        {/* Title */}
        <div
          className="text-center mb-12"
          style={{
            opacity: titleAnimation,
          }}
        >
          <h2 
            className={`font-bold mb-4 ${theme === 'dark' ? 'text-theme-light' : 'text-theme-dark'}`}
            style={{ fontSize: isStory ? 32 : isSquare ? 36 : 48 }}
          >
            Why Choose <span className="text-gradient">Ligaye</span>?
          </h2>
          <p 
            className="text-theme-gray-dark max-w-2xl mx-auto"
            style={{ fontSize: isStory ? 16 : isSquare ? 18 : 22 }}
          >
            Connecting talent with opportunity across The Gambia
          </p>
        </div>
        
        {/* Features Grid */}
        <div className={`max-w-6xl mx-auto grid gap-8 ${
          isStory ? 'grid-cols-1' : isSquare ? 'grid-cols-1' : 'grid-cols-2'
        }`}>
          
          {/* Job Seekers Section */}
          <div
            style={{
              opacity: leftSideAnimation.opacity,
              transform: `translateX(${leftSideAnimation.translateX}px)`,
            }}
          >
            <div className="glass-card p-8 h-full">
              <div className="flex items-center mb-6">
                <div 
                  className="w-12 h-12 rounded-lg mr-4 flex items-center justify-center"
                  style={{ background: withOpacity(BRAND_COLORS.primary.blue, 0.1) }}
                >
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ background: BRAND_COLORS.primary.blue }}
                  />
                </div>
                <div>
                  <h3 
                    className="text-primary-blue font-semibold"
                    style={{ fontSize: isStory ? 14 : 16 }}
                  >
                    Looking for work?
                  </h3>
                  <h4 
                    className={`font-bold ${theme === 'dark' ? 'text-theme-light' : 'text-theme-dark'}`}
                    style={{ fontSize: isStory ? 20 : isSquare ? 22 : 28 }}
                  >
                    Why job seekers love us
                  </h4>
                </div>
              </div>
              
              <div className="space-y-6">
                {CONTENT.features.jobSeekers.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start"
                    style={{
                      opacity: featureAnimations[index],
                      transform: `translateY(${(1 - featureAnimations[index]) * 20}px)`,
                    }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mt-2 mr-4 flex-shrink-0"
                      style={{ background: BRAND_COLORS.primary.blue }}
                    />
                    <div>
                      <p 
                        className={`font-medium ${theme === 'dark' ? 'text-theme-light' : 'text-theme-dark'}`}
                        style={{ fontSize: isStory ? 14 : isSquare ? 15 : 16 }}
                      >
                        {feature}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <button 
                  className="w-full py-3 px-6 rounded-xl font-semibold text-white shadow-level-2 transition-all"
                  style={{ 
                    background: BRAND_COLORS.primary.blue,
                    fontSize: isStory ? 14 : 16,
                    opacity: Math.max(0, (featureAnimations[3] || 0) - 0.2),
                  }}
                >
                  Start Job Search
                </button>
              </div>
            </div>
          </div>
          
          {/* Employers Section */}
          <div
            style={{
              opacity: rightSideAnimation.opacity,
              transform: `translateX(${rightSideAnimation.translateX}px)`,
            }}
          >
            <div className="glass-card p-8 h-full">
              <div className="flex items-center mb-6">
                <div 
                  className="w-12 h-12 rounded-lg mr-4 flex items-center justify-center"
                  style={{ background: withOpacity(BRAND_COLORS.secondary.green, 0.1) }}
                >
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ background: BRAND_COLORS.secondary.green }}
                  />
                </div>
                <div>
                  <h3 
                    className="text-secondary-green font-semibold"
                    style={{ fontSize: isStory ? 14 : 16 }}
                  >
                    Need to hire?
                  </h3>
                  <h4 
                    className={`font-bold ${theme === 'dark' ? 'text-theme-light' : 'text-theme-dark'}`}
                    style={{ fontSize: isStory ? 20 : isSquare ? 22 : 28 }}
                  >
                    Why employers choose us
                  </h4>
                </div>
              </div>
              
              <div className="space-y-6">
                {CONTENT.features.employers.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start"
                    style={{
                      opacity: featureAnimations[index],
                      transform: `translateY(${(1 - featureAnimations[index]) * 20}px)`,
                    }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mt-2 mr-4 flex-shrink-0"
                      style={{ background: BRAND_COLORS.secondary.green }}
                    />
                    <div>
                      <p 
                        className={`font-medium ${theme === 'dark' ? 'text-theme-light' : 'text-theme-dark'}`}
                        style={{ fontSize: isStory ? 14 : isSquare ? 15 : 16 }}
                      >
                        {feature}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <button 
                  className="w-full py-3 px-6 rounded-xl font-semibold text-white shadow-level-2 transition-all"
                  style={{ 
                    background: BRAND_COLORS.secondary.green,
                    fontSize: isStory ? 14 : 16,
                    opacity: Math.max(0, (featureAnimations[3] || 0) - 0.2),
                  }}
                >
                  Post Your First Job
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats section */}
        <div
          className="mt-12 text-center"
          style={{
            opacity: Math.max(0, titleAnimation - 0.3),
          }}
        >
          <div className={`grid ${
            isStory ? 'grid-cols-2 gap-4' : isSquare ? 'grid-cols-2 gap-6' : 'grid-cols-3 gap-8'
          } max-w-2xl mx-auto`}>
            <div className="text-center">
              <div 
                className="text-gradient font-bold mb-1"
                style={{ fontSize: isStory ? 24 : isSquare ? 28 : 32 }}
              >
                1000+
              </div>
              <div 
                className="text-theme-gray-dark"
                style={{ fontSize: isStory ? 12 : 14 }}
              >
                Active Jobs
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-gradient font-bold mb-1"
                style={{ fontSize: isStory ? 24 : isSquare ? 28 : 32 }}
              >
                500+
              </div>
              <div 
                className="text-theme-gray-dark"
                style={{ fontSize: isStory ? 12 : 14 }}
              >
                Companies
              </div>
            </div>
            {!isStory && (
              <div className="text-center">
                <div 
                  className="text-gradient font-bold mb-1"
                  style={{ fontSize: isStory ? 24 : isSquare ? 28 : 32 }}
                >
                  5000+
                </div>
                <div 
                  className="text-theme-gray-dark"
                  style={{ fontSize: isStory ? 12 : 14 }}
                >
                  Job Seekers
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};