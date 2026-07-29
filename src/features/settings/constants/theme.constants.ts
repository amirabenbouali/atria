import type { ThemeId } from '../types/settings.types';

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string;
  swatches: string[];
};

export const themeDefinitions: ThemeDefinition[] = [
  {
    id: 'soft-rose-glass',
    name: 'Soft Rose Glass',
    description: 'Warm black glass, blush gradients, muted mauve accents.',
    swatches: ['#F6A6BE', '#D989A6', '#9B6C8F', '#EBC7D4', '#C89BFF', '#C8A6A0'],
  },
  {
    id: 'violet-dusk',
    name: 'Violet Dusk',
    description: 'Deep graphite surfaces with violet, lilac, and starlit pink glow.',
    swatches: ['#C6A7FF', '#9D8CFF', '#6D5BD0', '#F0B6D2', '#7D6CA8', '#D8C7FF'],
  },
  {
    id: 'blue-hour',
    name: 'Blue Hour',
    description: 'Midnight blue glass, soft periwinkle accents, and cool lunar light.',
    swatches: ['#9EC5FF', '#7EA8E8', '#556B9D', '#D4E4FF', '#A8B8D8', '#88D7E8'],
  },
  {
    id: 'ember-noir',
    name: 'Ember Noir',
    description: 'Warm black panels with copper, rose-gold, and low sunset embers.',
    swatches: ['#F0A68A', '#D18474', '#9F6259', '#FFD0B8', '#E8A39D', '#C6A18F'],
  },
];

export const defaultThemeId: ThemeId = 'soft-rose-glass';

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && themeDefinitions.some((theme) => theme.id === value);
}

export function getThemeDefinition(themeId: ThemeId) {
  return themeDefinitions.find((theme) => theme.id === themeId) ?? themeDefinitions[0];
}
