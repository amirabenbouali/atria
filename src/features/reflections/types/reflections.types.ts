import type { EnergyLevel } from '../../timeQuality';

export type DailyReflection = {
  date: string;
  energy?: EnergyLevel;
  mood?: EnergyLevel;
  note?: string;
  highlight?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyReflectionDraft = {
  date: string;
  energy?: EnergyLevel;
  mood?: EnergyLevel;
  note?: string;
  highlight?: string;
  photoUrl?: string;
};

export type ReflectionsByDate = Record<string, DailyReflection>;
