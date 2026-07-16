/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base:        '#FAF5F2',
        card:        '#F4EEE8',
        accent:      '#E6D2CC',
        accentHover: '#D8C4B6',
        primary:     '#2C2A2A',
        secondary:   '#7A706B',
        line:        '#DDD4CC'
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body:    ['Inter', 'sans-serif']
      },
      letterSpacing: {
        tightest: '-0.02em'
      },
      borderRadius: {
        btn: '12px',
        card: '20px'
      },
      boxShadow: {
        card: '0 6px 20px rgba(0,0,0,0.05)'
      },
      transitionDuration: {
        DEFAULT: '350ms'
      }
    }
  },
  plugins: []
};
