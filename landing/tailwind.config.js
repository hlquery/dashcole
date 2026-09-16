/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sohne: ['sohne-var', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: ['sohne-var', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontWeight: {
        light: '400',
        normal: '500',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      colors: {
        'stripe-blue': 'rgb(10, 37, 64)',
        'stripe-text': 'rgb(10, 37, 64)',
      },
      fontSize: {
        'stripe-hero': ['56px', { lineHeight: '68px', letterSpacing: '-0.03em' }],
        'stripe-heading': ['40px', { lineHeight: '52px', letterSpacing: '-0.025em' }],
        'stripe-subheading': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        'stripe-lead': ['20px', { lineHeight: '30px', letterSpacing: '-0.02em' }],
        'stripe-base': ['16px', { lineHeight: '26px', letterSpacing: '-0.01em' }],
        'stripe-sm': ['14px', { lineHeight: '22px', letterSpacing: '-0.005em' }],
      }
    },
  },
  plugins: [],
}