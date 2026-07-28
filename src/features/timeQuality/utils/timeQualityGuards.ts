import type {
  EnergyLevel,
  EnergyPreferenceSlot,
  EnergyRequirement,
  PreferredTimeOfDay,
  TimeQuality,
} from '../types/timeQuality.types';

export const energyRequirements: EnergyRequirement[] = ['low', 'medium', 'high'];
export const preferredTimesOfDay: PreferredTimeOfDay[] = ['morning', 'afternoon', 'evening', 'any'];
export const timeQualities: TimeQuality[] = [
  'deep-focus',
  'creative',
  'light-work',
  'social',
  'recovery',
  'neutral',
];

export const defaultEnergyPreferenceSlots: EnergyPreferenceSlot[] = [
  { timeOfDay: 'morning', expectedEnergy: 4, timeQuality: 'deep-focus' },
  { timeOfDay: 'afternoon', expectedEnergy: 3, timeQuality: 'light-work' },
  { timeOfDay: 'evening', expectedEnergy: 2, timeQuality: 'recovery' },
];

export function isEnergyLevel(value: unknown): value is EnergyLevel {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;
}

export function isEnergyRequirement(value: unknown): value is EnergyRequirement {
  return energyRequirements.includes(value as EnergyRequirement);
}

export function isPreferredTimeOfDay(value: unknown): value is PreferredTimeOfDay {
  return preferredTimesOfDay.includes(value as PreferredTimeOfDay);
}

export function isTimeQuality(value: unknown): value is TimeQuality {
  return timeQualities.includes(value as TimeQuality);
}
