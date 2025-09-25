/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './angular-app/src/**/*.{html,ts,scss}',
    './trading-api/src/**/*.{ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--tw-color-primary) / <alpha-value>)',
        accent: 'rgb(var(--tw-color-accent) / <alpha-value>)',
        warning: 'rgb(var(--tw-color-warning) / <alpha-value>)',
        danger: 'rgb(var(--tw-color-danger) / <alpha-value>)',
        info: 'rgb(var(--tw-color-info) / <alpha-value>)',
        success: 'rgb(var(--tw-color-success) / <alpha-value>)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
};
