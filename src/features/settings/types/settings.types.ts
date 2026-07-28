import type { CalendarItemType, EventCategory } from '../../calendar/types/calendar.types';
import type { DayPeriod, EnergyLevel, EnergyProfile, TimeQuality } from '../../timeQuality';

export type DefaultView = 'calendar' | 'today' | 'insights';

export type SettingsPreferences = {
  weekStartsOnMonday: boolean;
  defaultItemType: CalendarItemType;
  defaultCategory: EventCategory;
  defaultView: DefaultView;
  energyProfile: EnergyProfile;
};

export type SettingsEnergyProfileUpdate = {
  period: DayPeriod;
  energy?: EnergyLevel;
  preferredQualities?: TimeQuality[];
};
