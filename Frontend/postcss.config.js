export default {
    plugins: {
      '@tailwindcss/postcss': {},
    },
    extend: {
  keyframes: {
    'fade-in': {
      '0%': { opacity: '0', transform: 'translateY(10px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
  },
  animation: {
    'fade-in': 'fade-in 0.5s ease-out',
  },
},
extend: {
  keyframes: {
    shine: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
  },
  animation: {
    shine: 'shine 1.5s linear infinite',
  },
}

  }
  