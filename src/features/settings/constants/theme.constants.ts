import type {
  AccentColour,
  AtmosphereTheme,
  ThemeId,
  WorkspaceMode,
} from '../types/settings.types';

export type AtmosphereDefinition = {
  id: AtmosphereTheme;
  label: string;
  description: string;
  appearance: 'light' | 'dark';
  swatches: string[];
};

export type AccentDefinition = {
  id: AccentColour;
  label: string;
  description: string;
  swatch: string;
};

export type WorkspaceModeDefinition = {
  id: WorkspaceMode;
  label: string;
  description: string;
  density: 'comfortable' | 'standard' | 'compact';
  motion: 'minimal' | 'standard';
  showSecondaryMetrics: boolean;
  expandPlanningDetails: boolean;
  showTimelineMetadata: boolean;
};

export const atmosphereDefinitions: AtmosphereDefinition[] = [
  {
    id: 'dawn',
    label: 'Dawn',
    description: 'Soft, warm, and quiet.',
    appearance: 'dark',
    swatches: ['#120d11', '#f2a1bb', '#d688a2', '#f0c4d3'],
  },
  {
    id: 'daylight',
    label: 'Daylight',
    description: 'Clear, neutral, and open.',
    appearance: 'dark',
    swatches: ['#090d12', '#9ec5ff', '#cfd9ea', '#88d7e8'],
  },
  {
    id: 'twilight',
    label: 'Twilight',
    description: 'Muted, reflective, and atmospheric.',
    appearance: 'dark',
    swatches: ['#0a0710', '#c6a7ff', '#9d8cff', '#f0b6d2'],
  },
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Dark, focused, and low-distraction.',
    appearance: 'dark',
    swatches: ['#050507', '#7ea8e8', '#8f8b96', '#d8c7ff'],
  },
];

export const accentDefinitions: AccentDefinition[] = [
  { id: 'rose', label: 'Rose', description: 'Warm blush emphasis.', swatch: '#f39bbc' },
  { id: 'lavender', label: 'Lavender', description: 'Soft violet clarity.', swatch: '#c6a7ff' },
  { id: 'sage', label: 'Sage', description: 'Quiet green balance.', swatch: '#a8d6bd' },
  { id: 'amber', label: 'Amber', description: 'Low sunset warmth.', swatch: '#f0b27a' },
  { id: 'sky', label: 'Sky', description: 'Cool blue openness.', swatch: '#9ec5ff' },
  { id: 'neutral', label: 'Neutral', description: 'Minimal graphite focus.', swatch: '#c7c0ca' },
];

export const workspaceModeDefinitions: WorkspaceModeDefinition[] = [
  {
    id: 'calm',
    label: 'Calm',
    description: 'Keeps the workspace spacious and surfaces only what matters now.',
    density: 'comfortable',
    motion: 'minimal',
    showSecondaryMetrics: false,
    expandPlanningDetails: false,
    showTimelineMetadata: false,
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'A clear mix of planning detail, reflection, and context.',
    density: 'standard',
    motion: 'standard',
    showSecondaryMetrics: true,
    expandPlanningDetails: false,
    showTimelineMetadata: true,
  },
  {
    id: 'planner',
    label: 'Planner',
    description: 'Shows more timing, structure, and scheduling information.',
    density: 'compact',
    motion: 'standard',
    showSecondaryMetrics: true,
    expandPlanningDetails: true,
    showTimelineMetadata: true,
  },
];

export const defaultAtmosphere: AtmosphereTheme = 'dawn';
export const defaultAccent: AccentColour = 'rose';
export const defaultWorkspaceMode: WorkspaceMode = 'balanced';

export function isAtmosphereTheme(value: unknown): value is AtmosphereTheme {
  return typeof value === 'string' && atmosphereDefinitions.some((theme) => theme.id === value);
}

export function isAccentColour(value: unknown): value is AccentColour {
  return typeof value === 'string' && accentDefinitions.some((accent) => accent.id === value);
}

export function isWorkspaceMode(value: unknown): value is WorkspaceMode {
  return typeof value === 'string' && workspaceModeDefinitions.some((mode) => mode.id === value);
}

export function getAtmosphereDefinition(id: AtmosphereTheme) {
  return atmosphereDefinitions.find((theme) => theme.id === id) ?? atmosphereDefinitions[0];
}

export function getAccentDefinition(id: AccentColour) {
  return accentDefinitions.find((accent) => accent.id === id) ?? accentDefinitions[0];
}

export function getWorkspaceModeDefinition(id: WorkspaceMode) {
  return workspaceModeDefinitions.find((mode) => mode.id === id) ?? workspaceModeDefinitions[1];
}

export function mapLegacyThemeToAtmosphere(themeId: unknown): AtmosphereTheme {
  const legacyMap: Record<ThemeId, AtmosphereTheme> = {
    'soft-rose-glass': 'dawn',
    'violet-dusk': 'twilight',
    'blue-hour': 'daylight',
    'ember-noir': 'midnight',
  };

  return typeof themeId === 'string' && themeId in legacyMap
    ? legacyMap[themeId as ThemeId]
    : defaultAtmosphere;
}
