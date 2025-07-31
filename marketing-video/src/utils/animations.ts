import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// Animation utility functions
export const useAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  return {
    frame,
    fps,
    // Convert seconds to frames
    sec: (seconds: number) => seconds * fps,
    // Convert frames to seconds
    toSec: (frames: number) => frames / fps,
  };
};

// Fade in animation
export const useFadeIn = (startFrame: number, duration: number = 30) => {
  const frame = useCurrentFrame();
  
  return interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
};

// Slide up animation
export const useSlideUp = (startFrame: number, duration: number = 45, distance: number = 50) => {
  const frame = useCurrentFrame();
  
  const translateY = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [distance, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: (t) => 1 - Math.pow(1 - t, 3), // easeOut cubic
    }
  );
  
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  return { translateY, opacity };
};

// Slide in from left
export const useSlideInLeft = (startFrame: number, duration: number = 45, distance: number = 100) => {
  const frame = useCurrentFrame();
  
  const translateX = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [-distance, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: (t) => 1 - Math.pow(1 - t, 3),
    }
  );
  
  const opacity = useFadeIn(startFrame, duration);
  
  return { translateX, opacity };
};

// Slide in from right
export const useSlideInRight = (startFrame: number, duration: number = 45, distance: number = 100) => {
  const frame = useCurrentFrame();
  
  const translateX = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [distance, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: (t) => 1 - Math.pow(1 - t, 3),
    }
  );
  
  const opacity = useFadeIn(startFrame, duration);
  
  return { translateX, opacity };
};

// Scale in animation
export const useScaleIn = (startFrame: number, duration: number = 30, initialScale: number = 0.8) => {
  const frame = useCurrentFrame();
  
  const scale = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [initialScale, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: (t) => 1 - Math.pow(1 - t, 3),
    }
  );
  
  const opacity = useFadeIn(startFrame, duration);
  
  return { scale, opacity };
};

// Spring animation
export const useSpringAnimation = (startFrame: number, config?: Parameters<typeof spring>[0]) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  return spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
      mass: 1,
      ...config,
    },
  });
};

// Stagger animation for multiple elements
export const useStaggerAnimation = (
  startFrame: number,
  itemCount: number,
  staggerDelay: number = 5,
  animationDuration: number = 30
) => {
  const frame = useCurrentFrame();
  
  return Array.from({ length: itemCount }, (_, index) => {
    const itemStartFrame = startFrame + (index * staggerDelay);
    return useFadeIn(itemStartFrame, animationDuration);
  });
};

// Text reveal animation (character by character)
export const useTextReveal = (text: string, startFrame: number, duration: number = 60) => {
  const frame = useCurrentFrame();
  
  const progress = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  const visibleChars = Math.floor(progress * text.length);
  return text.slice(0, visibleChars);
};

// Parallax effect
export const useParallax = (startFrame: number, speed: number = 0.5) => {
  const frame = useCurrentFrame();
  
  return (frame - startFrame) * speed;
};

// Bounce animation
export const useBounce = (startFrame: number, duration: number = 60) => {
  const frame = useCurrentFrame();
  
  const progress = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, Math.PI * 2],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'extend',
    }
  );
  
  return Math.sin(progress) * 10; // 10px bounce amplitude
};

// Pulse animation
export const usePulse = (period: number = 60) => {
  const frame = useCurrentFrame();
  
  const progress = (frame % period) / period;
  return 0.8 + 0.2 * Math.sin(progress * Math.PI * 2);
};

// Rotate animation
export const useRotate = (startFrame: number, duration: number, rotations: number = 1) => {
  const frame = useCurrentFrame();
  
  return interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 360 * rotations],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
};