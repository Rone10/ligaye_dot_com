// Brand colors extracted from Ligaye.com CSS variables
export const BRAND_COLORS = {
  primary: {
    blue: 'hsl(229, 95%, 64%)',
    blueLight: 'hsl(229, 100%, 73%)',
    blueDark: 'hsl(229, 95%, 54%)',
  },
  secondary: {
    green: 'hsl(162, 96%, 41%)',
    greenLight: 'hsl(162, 96%, 51%)',
    greenDark: 'hsl(162, 96%, 31%)',
  },
  theme: {
    dark: 'hsl(230, 25%, 14%)',
    light: 'hsl(226, 100%, 97%)',
    gray: 'hsl(226, 25%, 92%)',
    grayDark: 'hsl(225, 17%, 67%)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, hsl(229, 95%, 64%), hsl(162, 96%, 41%))',
    background: 'linear-gradient(135deg, hsl(226, 100%, 97%), hsl(225, 97%, 98%))',
    backgroundDark: 'linear-gradient(135deg, hsl(230, 25%, 14%), hsl(225, 25%, 16%))',
  },
  glass: {
    light: 'rgba(255, 255, 255, 0.7)',
    dark: 'rgba(30, 30, 30, 0.7)',
    border: 'rgba(255, 255, 255, 0.3)',
    borderDark: 'rgba(255, 255, 255, 0.1)',
  },
  shadows: {
    level1: '0 2px 10px rgba(31, 38, 135, 0.05)',
    level2: '0 8px 32px rgba(31, 38, 135, 0.1)',
    level3: '0 15px 35px rgba(31, 38, 135, 0.15)',
    level4: '0 24px 48px rgba(31, 38, 135, 0.2)',
  }
};

// Helper functions for color manipulation
export const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('hsl')) {
    return color.replace('hsl(', `hsla(`).replace(')', `, ${opacity})`);
  }
  if (color.startsWith('rgb')) {
    return color.replace('rgb(', `rgba(`).replace(')', `, ${opacity})`);
  }
  return color;
};

export const getRandomGradient = (): string => {
  const gradients = Object.values(BRAND_COLORS.gradients);
  return gradients[Math.floor(Math.random() * gradients.length)];
};