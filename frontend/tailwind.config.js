/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // =====================================================
        // BuzzBase ブランドカラー（新デザインシステム）
        // =====================================================

        // プライマリ: オレンジ（活力・ポジティブ）
        primary: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc170',
          400: '#ffa033',
          500: '#f29801', // メインカラー - #f29801
          600: '#e38500',
          700: '#bc6502',
          800: '#954f09',
          900: '#79420b',
          950: '#422004',
        },

        // セカンダリ: レッド（情熱・注目）
        secondary: {
          50: '#fff1f0',
          100: '#ffe1df',
          200: '#ffc8c4',
          300: '#ffa39c',
          400: '#ff6b62',
          500: '#e61f13', // アクセントカラー - #e61f13
          600: '#d41108',
          700: '#b00d06',
          800: '#910f0a',
          900: '#78120f',
          950: '#420503',
        },

        // ニュートラル: グレー（テキスト・背景）
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },

        // レガシー互換（既存コンポーネント用）
        brand: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc170',
          400: '#ffa033',
          500: '#f29801',
          600: '#e38500',
          700: '#bc6502',
          800: '#954f09',
          900: '#79420b',
          950: '#422004',
        },
        accent: {
          50: '#fff1f0',
          100: '#ffe1df',
          200: '#ffc8c4',
          300: '#ffa39c',
          400: '#ff6b62',
          500: '#e61f13',
          600: '#d41108',
          700: '#b00d06',
          800: '#910f0a',
          900: '#78120f',
          950: '#420503',
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
        display: ['"DM Sans"', '"Noto Sans JP"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
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
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        button: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
