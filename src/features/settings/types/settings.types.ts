import type { CalendarItemType, EventCategory } from '../../calendar/types/calendar.types';
import type { DayPeriod, EnergyLevel, EnergyProfile, TimeQuality } from '../../timeQuality';

export type DefaultView = 'calendar' | 'today' | 'insights';
export type ThemeId = 'soft-rose-glass' | 'violet-dusk' | 'blue-hour' | 'ember-noir';

export type SettingsPreferences = {
  weekStartsOnMonday: boolean;
  defaultItemType: CalendarItemType;
  defaultCategory: EventCategory;
  defaultView: DefaultView;
  themeId: ThemeId;
  hasCompletedOnboarding: boolean;
  onboardingVersion: number;
  energyProfile: EnergyProfile;
};

export type SettingsEnergyProfileUpdate = {
  period: DayPeriod;
  energy?: EnergyLevel;
  preferredQualities?: TimeQuality[];
};
