/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}','./components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand:   { DEFAULT:'#4F46E5', dark:'#3730A3', light:'#EEF2FF' },
        sidebar: '#0F1117',
        success: '#16A34A',
        warning: '#CA8A04',
        danger:  '#DC2626',
        pending: '#2563EB',
        paused:  '#6B7280',
        review:  '#7C3AED',
        gold:    '#D97706',
        hr:      '#BE123C',
      },
      fontFamily: { geist: ['var(--font-geist)', 'system-ui', 'sans-serif'], mono: ['var(--font-geist-mono)', 'monospace'] },
    },
  },
  plugins: [],
};
