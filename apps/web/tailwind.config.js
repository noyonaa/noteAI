/** Colours come from CSS variables in src/styles/tokens.css so light/dark switch without `dark:` variants. */
const token = (name) => `var(--${name})`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        'surface-muted': token('surface-muted'),
        sidebar: token('sidebar'),
        border: token('border'),
        'border-strong': token('border-strong'),
        text: token('text'),
        muted: token('text-muted'),
        subtle: token('text-subtle'),
        primary: token('primary'),
        'on-primary': token('on-primary'),
        accent: token('accent'),
        'accent-soft': token('accent-soft'),
        'accent-text': token('accent-text'),
        'accent-wash': token('accent-wash'),
        success: token('success'),
        warning: token('warning'),
        danger: token('danger'),
      },
      fontFamily: {
        sans: ['"Manrope Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        control: '8px',
        card: '12px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        overlay: 'var(--shadow-overlay)',
      },
    },
  },
  plugins: [],
};
