import type {
  DayPeriod,
  EnergyLevel,
  EnergyProfile,
  EnergyRequirement,
  PreferredTimeOfDay,
  TimeQuality,
} from '../types/timeQuality.types';
import { isEnergyLevel, isTimeQuality } from './timeQualityGuards';

export const dayPeriods: DayPeriod[] = ['morning', 'afternoon', 'evening'];

export const defaultEnergyProfile: EnergyProfile = {
  morning: {
    energy: 4,
    preferredQualities: ['deep-focus', 'creative'],
  },
  afternoon: {
    energy: 3,
    preferredQualities: ['light-work', 'social'],
  },
  evening: {
    energy: 2,
    preferredQualities: ['recovery', 'neutral'],
  },
};

const minimumEnergyByRequirement: Record<EnergyRequirement, EnergyLevel> = {
  low: 2,
  medium: 3,
  high: 4,
};

function normalizePreferredQualities(value: unknown): TimeQuality[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(value.filter(isTimeQuality)));
}

export function normalizeEnergyProfile(value: unknown): EnergyProfile {
  const storedProfile = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Partial<Record<DayPeriod, Partial<EnergyProfile[DayPeriod]>>>
    : {};

  return dayPeriods.reduce<EnergyProfile>((profile, period) => {
    const storedPeriod = storedProfile[period];
    const defaultPeriod = defaultEnergyProfile[period];

    profile[period] = {
      energy: isEnergyLevel(storedPeriod?.energy) ? storedPeriod.energy : defaultPeriod.energy,
      preferredQualities: Array.isArray(storedPeriod?.preferredQualities)
        ? normalizePreferredQualities(storedPeriod.preferredQualities)
        : defaultPeriod.preferredQualities,
    };

    return profile;
  }, {} as EnergyProfile);
}

export function getDayPeriodForDate(date: Date): DayPeriod {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return 'morning';
  }

  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }

  return 'evening';
}

export function getEnergyForDate(date: Date, profile: EnergyProfile): EnergyLevel {
  return profile[getDayPeriodForDate(date)].energy;
}

export function getPreferredQualitiesForDate(date: Date, profile: EnergyProfile): TimeQuality[] {
  return profile[getDayPeriodForDate(date)].preferredQualities;
}

export function getEnergyCompatibilityNote(
  preferredTimeOfDay: PreferredTimeOfDay | undefined,
  energyRequired: EnergyRequirement | undefined,
  profile: EnergyProfile,
) {
  if (!preferredTimeOfDay || preferredTimeOfDay === 'any' || !energyRequired) {
    return undefined;
  }

  const periodEnergy = profile[preferredTimeOfDay].energy;
  const minimumEnergy = minimumEnergyByRequirement[energyRequired];

  if (periodEnergy >= minimumEnergy) {
    return undefined;
  }

  return `Your ${preferredTimeOfDay} energy is currently set to ${periodEnergy}.`;
}
