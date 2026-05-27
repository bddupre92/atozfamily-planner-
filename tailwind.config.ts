import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6EF',
        paper: '#F4EEE2',
        ink: '#2D2418',
        'ink-soft': '#5C4D38',
        'ink-muted': '#8A7A60',
        rule: '#D9CFB8',
        accent: '#B86A3F',
        'accent-soft': '#F4E3D4',
        forest: '#3E5641',
        'moss-soft': '#DDE5D5',
        terracotta: '#C26B4F',
        'terracotta-soft': '#F5E0D6',
        sage: '#7B8F5C',
        'sage-soft': '#E5EAD8',
        lavender: '#8B7FB5',
        'lavender-soft': '#E6E1F0',
      },
      fontFamily: {
        display: ['Fraunces', 'Iowan Old Style', 'Georgia', 'serif'],
        body: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
