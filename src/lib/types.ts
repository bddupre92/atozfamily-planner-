export type ColorKey = 'terracotta' | 'sage' | 'lavender';

export const COLOR_MAP: Record<ColorKey, { swatch: string; soft: string }> = {
  terracotta: { swatch: '#C26B4F', soft: '#F5E0D6' },
  sage: { swatch: '#7B8F5C', soft: '#E5EAD8' },
  lavender: { swatch: '#8B7FB5', soft: '#E6E1F0' },
};
