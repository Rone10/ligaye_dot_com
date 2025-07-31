import React from 'react';
import { useTextReveal, useStaggerAnimation } from '../utils/animations';

interface AnimatedTextProps {
  text: string;
  startFrame: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TypewriterText: React.FC<AnimatedTextProps> = ({
  text,
  startFrame,
  duration = 60,
  className = '',
  style = {},
}) => {
  const visibleText = useTextReveal(text, startFrame, duration);
  
  return (
    <span className={className} style={style}>
      {visibleText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

interface StaggeredWordsProps {
  words: string[];
  startFrame: number;
  staggerDelay?: number;
  animationDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const StaggeredWords: React.FC<StaggeredWordsProps> = ({
  words,
  startFrame,
  staggerDelay = 10,
  animationDuration = 30,
  className = '',
  style = {},
}) => {
  const animations = useStaggerAnimation(startFrame, words.length, staggerDelay, animationDuration);
  
  return (
    <span className={className} style={style}>
      {words.map((word, index) => (
        <span
          key={index}
          style={{
            opacity: animations[index],
            display: 'inline-block',
            marginRight: '0.25em',
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
};

interface FadeInTextProps {
  children: React.ReactNode;
  startFrame: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const FadeInText: React.FC<FadeInTextProps> = ({
  children,
  startFrame,
  duration = 30,
  className = '',
  style = {},
}) => {
  const { useFadeIn } = require('../utils/animations');
  const opacity = useFadeIn(startFrame, duration);
  
  return (
    <span 
      className={className} 
      style={{ 
        ...style, 
        opacity,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      {children}
    </span>
  );
};