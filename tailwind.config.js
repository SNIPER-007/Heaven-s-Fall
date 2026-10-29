/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blood: {
          900: '#3a0508',
          800: '#58080d',
          700: '#7a0e14',
          600: '#9d141c',
          500: '#c01d27',
        },
        gold: {
          300: '#f9e79f',
          400: '#f5cba7',
          500: '#d4af37',
          600: '#b89025',
          700: '#8c6d17',
        },
        ember: {
          500: '#ea580c',
          600: '#c2410c',
          700: '#9a3412',
        },
        gothic: {
          950: '#060407',
          900: '#0c080d',
          850: '#130d15',
          800: '#1b141e',
          750: '#231a26',
          700: '#2d2232',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'Cinzel Decorative', 'Georgia', 'serif'],
        gothic: ['UnifrakturMaguntia', 'MedievalSharp', 'Cinzel', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 3s infinite',
        'float-embers': 'floatEmbers 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(212,175,55,0.4))' },
          '50%': { opacity: '0.85', filter: 'drop-shadow(0 0 25px rgba(234,88,12,0.7))' },
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '0.99' },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
