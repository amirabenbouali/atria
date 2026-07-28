export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export type EnergyRequirement = 'low' | 'medium' | 'high';

export type PreferredTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'any';

export type DayPeriod = 'morning' | 'afternoon' | 'evening';

export type TimeQuality =
  | 'deep-focus'
  | 'creative'
  | 'light-work'
  | 'social'
  | 'recovery'
  | 'neutral';

export type EnergyPreferenceSlot = {
  timeOfDay: DayPeriod;
  expectedEnergy: EnergyLevel;
  timeQuality: TimeQuality;
};

export type EnergyProfilePeriod = {
  energy: EnergyLevel;
  preferredQualities: TimeQuality[];
};

export type EnergyProfile = Record<DayPeriod, EnergyProfilePeriod>;
