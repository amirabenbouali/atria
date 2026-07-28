export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export type EnergyRequirement = 'low' | 'medium' | 'high';

export type PreferredTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'any';

export type TimeQuality =
  | 'deep-focus'
  | 'creative'
  | 'light-work'
  | 'social'
  | 'recovery'
  | 'neutral';

export type EnergyPreferenceSlot = {
  timeOfDay: Exclude<PreferredTimeOfDay, 'any'>;
  expectedEnergy: EnergyLevel;
  timeQuality: TimeQuality;
};
