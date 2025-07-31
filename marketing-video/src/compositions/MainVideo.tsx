import React from 'react';
import { Sequence, useVideoConfig } from 'remotion';
import { SCENE_TIMING } from '../utils/constants';
import { IntroScene } from './scenes/IntroScene';
import { LandingShowcase } from './scenes/LandingShowcase';
import { JobsPageShowcase } from './scenes/JobsPageShowcase';
import { FeaturesScene } from './scenes/FeaturesScene';
import { CallToActionScene } from './scenes/CallToActionScene';

interface MainVideoProps {
  theme?: 'light' | 'dark';
  format?: 'landscape' | 'square' | 'story';
}

export const MainVideo: React.FC<MainVideoProps> = ({ 
  theme = 'light',
  format = 'landscape' 
}) => {
  const { width, height } = useVideoConfig();
  
  // Responsive layout based on format
  const isSquare = format === 'square';
  const isStory = format === 'story';
  
  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${
        theme === 'dark' ? 'gradient-bg-dark' : 'gradient-bg'
      }`}
      style={{ 
        width: width, 
        height: height,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      {/* Scene 1: Intro - Logo and tagline */}
      <Sequence
        from={SCENE_TIMING.intro.start}
        durationInFrames={SCENE_TIMING.intro.duration}
      >
        <IntroScene theme={theme} format={format} />
      </Sequence>

      {/* Scene 2: Landing Page Showcase */}
      <Sequence
        from={SCENE_TIMING.landingShowcase.start}
        durationInFrames={SCENE_TIMING.landingShowcase.duration}
      >
        <LandingShowcase theme={theme} format={format} />
      </Sequence>

      {/* Scene 3: Jobs Page Demo */}
      <Sequence
        from={SCENE_TIMING.jobsPageDemo.start}
        durationInFrames={SCENE_TIMING.jobsPageDemo.duration}
      >
        <JobsPageShowcase theme={theme} format={format} />
      </Sequence>

      {/* Scene 4: Platform Features */}
      <Sequence
        from={SCENE_TIMING.features.start}
        durationInFrames={SCENE_TIMING.features.duration}
      >
        <FeaturesScene theme={theme} format={format} />
      </Sequence>

      {/* Scene 5: Call to Action */}
      <Sequence
        from={SCENE_TIMING.callToAction.start}
        durationInFrames={SCENE_TIMING.callToAction.duration}
      >
        <CallToActionScene theme={theme} format={format} />
      </Sequence>
    </div>
  );
};