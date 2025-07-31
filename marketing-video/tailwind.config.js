/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': {
          DEFAULT: 'hsl(229, 95%, 64%)',
          light: 'hsl(229, 100%, 73%)'
        },
        'secondary-green': 'hsl(162, 96%, 41%)',
        'theme-dark': 'hsl(230, 25%, 14%)',
        'theme-light': 'hsl(226, 100%, 97%)',
        'theme-gray': 'hsl(226, 25%, 92%)',
        'theme-gray-dark': 'hsl(225, 17%, 67%)',
      },
      boxShadow: {
        'level-1': '0 2px 10px rgba(31, 38, 135, 0.05)',
        'level-2': '0 8px 32px rgba(31, 38, 135, 0.1)',
        'level-3': '0 15px 35px rgba(31, 38, 135, 0.15)',
        'level-4': '0 24px 48px rgba(31, 38, 135, 0.2)',
      },
      backdropBlur: {
        'glass': '10px',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.6s ease-out forwards',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }
    },
  },
  plugins: [],
}