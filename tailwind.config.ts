import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./src/components/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Questions are set in a text serif so KaTeX's own serif math sits
        // inside the sentence instead of floating on top of it.
        question: ['var(--font-question)', 'Georgia', 'serif'],
        sans: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        // Timers, scores, counters — instrumentation.
        mono: ['var(--font-data)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'question-sm': ['1.375rem', { lineHeight: '1.45' }],
        question: ['1.75rem', { lineHeight: '1.4' }],
        'question-lg': ['2.25rem', { lineHeight: '1.32' }],
      },
      colors: {
        paper: 'hsl(var(--paper))',
        ink: {
          DEFAULT: 'hsl(var(--ink))',
          soft: 'hsl(var(--ink-soft))',
          faint: 'hsl(var(--ink-faint))',
        },
        rule: {
          DEFAULT: 'hsl(var(--rule))',
          strong: 'hsl(var(--rule-strong))',
        },
        surface: 'hsl(var(--surface))',
        exact: {
          DEFAULT: 'hsl(var(--exact))',
          soft: 'hsl(var(--exact-soft))',
        },
        approx: {
          DEFAULT: 'hsl(var(--approx))',
          soft: 'hsl(var(--approx-soft))',
        },
        correct: {
          DEFAULT: 'hsl(var(--correct))',
          soft: 'hsl(var(--correct-soft))',
        },
        wrong: {
          DEFAULT: 'hsl(var(--wrong))',
          soft: 'hsl(var(--wrong-soft))',
        },

        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'calc(var(--radius) + 2px)',
        md: 'calc(var(--radius) + 1px)',
        sm: 'var(--radius)',
      },
      keyframes: {
        'rule-flash': {
          '0%': { backgroundColor: 'transparent' },
          '30%': { backgroundColor: 'hsl(var(--correct-soft))' },
          '100%': { backgroundColor: 'transparent' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'rule-flash': 'rule-flash 600ms ease-out',
        'slide-up': 'slide-up 160ms ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;
