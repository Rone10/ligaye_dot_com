// Video configuration constants
export const VIDEO_CONFIG = {
  // Main video (16:9 landscape)
  main: {
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 1800, // 60 seconds at 30fps
  },
  // Square format for social media
  square: {
    width: 1080,
    height: 1080,
    fps: 30,
    durationInFrames: 1800,
  },
  // Story format (9:16 portrait)
  story: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 1800,
  },
};

// Scene timing (in frames at 30fps)
export const SCENE_TIMING = {
  intro: {
    start: 0,
    duration: 240, // 8 seconds
  },
  landingShowcase: {
    start: 240,
    duration: 360, // 12 seconds
  },
  jobsPageDemo: {
    start: 600,
    duration: 450, // 15 seconds
  },
  features: {
    start: 1050,
    duration: 450, // 15 seconds
  },
  callToAction: {
    start: 1500,
    duration: 300, // 10 seconds
  },
};

// Animation presets
export const ANIMATION_PRESETS = {
  fadeIn: {
    duration: 30, // 1 second
    easing: 'easeOut',
  },
  slideUp: {
    duration: 45, // 1.5 seconds
    easing: 'easeOut',
    distance: 50,
  },
  slideInLeft: {
    duration: 45,
    easing: 'easeOut',
    distance: 100,
  },
  slideInRight: {
    duration: 45,
    easing: 'easeOut',
    distance: 100,
  },
  scaleIn: {
    duration: 30,
    easing: 'easeOut',
    scale: 0.8,
  },
  bounce: {
    duration: 60,
    easing: 'easeInOut',
  },
};

// Typography scales
export const TYPOGRAPHY = {
  hero: {
    fontSize: 72,
    fontWeight: 700,
    lineHeight: 1.1,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 500,
    lineHeight: 1.3,
  },
  body: {
    fontSize: 24,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 1.4,
  },
};

// Layout constants
export const LAYOUT = {
  padding: {
    small: 20,
    medium: 40,
    large: 80,
  },
  borderRadius: {
    small: 8,
    medium: 16,
    large: 24,
  },
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 64,
  },
};

// Content constants
export const CONTENT = {
  companyName: 'Ligaye.com',
  tagline: "Gambia's Digital Career Revolution",
  features: {
    jobSeekers: [
      'Connect directly with top Gambian employers',
      'Full transparency from the start',
      'One-click applications',
      'Local opportunities',
    ],
    employers: [
      'Reach qualified local talent',
      'Easy application management',
      'Flexible payment options',
      'Build your employer brand',
    ],
  },
  callToAction: {
    primary: 'Find Your Dream Job',
    secondary: 'Post Your First Job',
    website: 'www.ligaye.com',
  },
};