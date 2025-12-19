/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // BuzzBase ブランドカラー
        brand: {
          50: '#fef3f2',
          100: '#ffe4e1',
          200: '#ffcdc8',
          300: '#ffa9a1',
          400: '#ff7a6b',
          500: '#f94d3c', // メインカラー - エネルギッシュなコーラルレッド
          600: '#e62e1c',
          700: '#c12313',
          800: '#a02114',
          900: '#842218',
          950: '#480d08',
        },
        accent: {
          50: '#f0fdfa',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5fe9cd',
          400: '#2dd4b5', // アクセントカラー - ミント
          500: '#14b89e',
          600: '#0d9480',
          700: '#0f7669',
          800: '#115e55',
          900: '#134e47',
          950: '#042f2b',
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          '"Hiragino Sans"',
          '"Hiragino Kaku Gothic ProN"',
          'Meiryo',
          'sans-serif',
        ],
        display: [
          '"DM Sans"',
          '"Noto Sans JP"',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

