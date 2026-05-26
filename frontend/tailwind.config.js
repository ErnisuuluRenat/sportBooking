/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          default: 'var(--border-default)',
          hover: 'var(--border-hover)',
        },
        orange: {
          DEFAULT: '#F97316',
          dim: 'var(--orange-dim)',
          border: 'var(--orange-border)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          ghost: 'var(--text-ghost)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        btn: '8px',
      },
    },
  },
  plugins: [],
}