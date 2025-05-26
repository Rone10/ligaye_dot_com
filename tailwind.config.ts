import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'gradient-bg': 'linear-gradient(135deg, hsl(var(--bg-gradient-from)), hsl(var(--bg-gradient-to)))',
  		},
  		borderRadius: {
  			'sm': '4px',
  			'md': '10px',
  			'lg': '16px',
  			'xl': '20px',
  			'full': '9999px',
  			'shadcn-lg': 'var(--radius)',
  			'shadcn-md': 'calc(var(--radius) - 2px)',
  			'shadcn-sm': 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			'primary-blue': {
  				DEFAULT: 'hsl(var(--primary-blue))',
  				light: 'hsl(var(--primary-blue-light))'
  			},
  			'secondary-green': 'hsl(var(--secondary-green))',
  			'theme-dark': 'hsl(var(--theme-dark))',
  			'theme-light': 'hsl(var(--theme-light))',
  			'theme-gray': 'hsl(var(--theme-gray))',
  			'theme-gray-dark': 'hsl(var(--theme-gray-dark))',
  			// Legacy color names for backward compatibility
  			dark: 'hsl(var(--theme-dark))',
  			light: 'hsl(var(--theme-light))',
  			gray: 'hsl(var(--theme-gray))',
  			'gray-dark': 'hsl(var(--theme-gray-dark))',
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontSize: {
  			'xs': '12px',     // Extra Small
  			'sm': '13px',     // Small
  			'base': '15px',   // Medium
  			'lg': '16px',     // Medium Large
  			'xl': '18px',     // Large
  			'2xl': '20px',    // Large Subheader
  			'3xl': '24px',    // Header
  		},
  		fontWeight: {
  			'normal': '400',
  			'medium': '500',
  			'semibold': '600',
  			'bold': '700',
  		},
  		lineHeight: {
  			'tight': '1.2',
  			'normal': '1.5',
  			'relaxed': '1.8',
  		},
  		spacing: {
  			'xxs': '4px',
  			'xs': '8px',
  			'sm': '12px',
  			'md': '16px',
  			'lg': '20px',
  			'xl': '25px',
  			'2xl': '30px',
  			'3xl': '40px',
  			'4xl': '50px',
  			'5xl': '60px',
  		},
  		boxShadow: {
  			'level-1': 'var(--shadow-level-1)',
  			'level-2': 'var(--shadow-level-2)',
  			'level-3': 'var(--shadow-level-3)',
  			'level-4': 'var(--shadow-level-4)',
  			'focus': '0 0 0 3px rgba(74, 108, 250, 0.15)',
  		},
  		transitionDuration: {
  			'fast': '150ms',
  			'standard': '300ms',
  			'slow': '500ms',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			appear: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'appear-zoom': {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			appear: 'appear 0.3s ease-out forwards',
  			'appear-zoom': 'appear-zoom 0.3s ease-out forwards'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
