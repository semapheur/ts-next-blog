/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin')
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)']
      },
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        'text': 'rgb(var(--color-text) / <alpha-value>)',
        axiom: 'rgb(var(--color-axiom) / <alpha-value>)',
        theorem: 'rgb(var(--color-theorem) / <alpha-value>)',
        proposition: 'rgb(var(--color-proposition) / <alpha-value>)',
        lemma: 'rgb(var(--color-lemma) / <alpha-value>)',
        corollary: 'rgb(var(--color-corollary) / <alpha-value>)',
        definition: 'rgb(var(--color-definition) / <alpha-value>)',
        example: 'rgb(var(--color-example) / <alpha-value>)',
      },
      boxShadow: {
        'inner-l': 'inset 2px 0 4px 0px rgba(0 0 0 / 0.1)',
        'glow-sm': '0px 9px 30px rgba(0 0 0 / 0.1)'
      },
      keyframes: {
        draw: {
          to: { 'stroke-dashoffset': 0 },
        },
        morph: {
          '0%': { filter: 'blur(0)', },
          '100%': { filter: 'blur(2rem)' },
        },
        fade: {
          from: {opacity: 0},
          to: {opacity: 1}
        },
        blink: {
          '0%': {opacity: 0}
        },
        neon: {
          from: {
            'text-shadow': `
              0 0 4px white,
              0 0 10px white,
              0 0 30px rgba(var(--color-header-accent) / 1),
              0 0 50px rgba(var(--color-header-accent) / 1),
              0 0 75px rgba(var(--color-header-accent) / 1),
              0 0 90px rgba(var(--color-header-accent) / 1)
            `
          },
          to: {
            'text-shadow': `
              0 0 2px white,
              0 0 5px white,
              0 0 15px rgb(var(--color-header-accent) / 1),
              0 0 25px rgb(var(--color-header-accent) / 1),
              0 0 35px rgb(var(--color-header-accent) / 1),
              0 0 45px rgb(var(--color-header-accent) / 1)
            `
          }
        },
        glitch: {
          '0%': { 'text-shadow': `
            0.025em 0 0 rgba(255 0 0 / 0.75),
            -0.025em -0.0125em 0 rgba(0 255 0 / 0.75),
            -0.0125em 0.025em 0 rgba(0 0 255 / 0.75);`
          },
          '15%': { 'text-shadow': `
            -0.025em -0.0125em 0 rgba(255 0 0 / 0.75),
            0.0125em 0.0125em 0 rgba(0 255 0 / 0.75),
            -0.025em -0.025em 0 rgba(0 0 255 / 0.75);`
          },
          '50%': { 'text-shadow': `
            0.0125em 0.025em 0 rgba(255 0 0 / 0.75),
            0.025em 0 0 rgba(0 255 0 / 0.75),
            0 -0.025em 0 rgba(0 0 255 / 0.75);`
          },
          '100%': { 'text-shadow': `
            -0.0125em 0 0 rgba(255 0 0 / 0.75),
            -0.0125em -0.0125em 0 rgba(0 255 0 / 0.75),
            -0.0125em -0.025em 0 rgba(0 0 255 / 0.75);`
          }
        },
      },
      animation: { // name|duration|easing|delay|iteration|direction|fill|state
        draw: 'draw 2s linear infinite',
        morph: 'morph 250ms forwards 2 alternate',
        blink: 'blink 1.5s steps(2) infinite',
        fade: 'fade 2s ease-in 1s alternate',
        neon: 'neon 1s ease-in-out infinite alternate',
        'glitch-slow': 'glitch 650ms infinite',
        'glitch-mid': 'glitch 500ms infinite',
        'glitch-fast': 'glitch 375ms infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
    plugin(function({ addBase, addUtilities, matchUtilities, theme }) {

      addBase({
        '*, ::before, ::after': {
          '--tw-translate-z': '0',
          '--tw-rotate-x': '0',
          '--tw-rotate-y': '0',
          '--tw-rotate-z': '0',
          '--tw-scale-z': '1',
          // '--tw-self-perspective': '0',
          '--tw-transform': [
            'translate3d(var(--tw-translate-x),var(--tw-translate-y),var(--tw-translate-z))',
            'rotateX(var(--tw-rotate-x)) rotateY(var(--tw-rotate-y)) rotateZ(var(--tw-rotate-z))',
            'skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))',
            'scale3d(var(--tw-scale-x), var(--tw-scale-y), var(--tw-scale-z))',
          ].join(' '),
        },
      })
      // Transform style
      addUtilities({
        '.transform-style-flat': {
          'transform-style': 'flat',
        },
        '.transform-style-3d': {
          'transform-style': 'preserve-3d',
        },
      })
      // Translate z
      matchUtilities({
        'translate-z': (value) => ({
          '--tw-translate-z': value,
          transform: `var(--tw-transform)`
        })
      }, {
        values: theme('translate'), supportsNegativeValues: true
      })
      // Perspective
      matchUtilities({
        'perspective': (value) => ({
          'perspective': value,
        })
      }, {
        values: theme('perspectiveValues'), supportsNegativeValues: true
      })
    }),
  ],
}
