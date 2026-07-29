import type { CalendarItemType, CalendarView, EventCategory } from '../../calendar/types/calendar.types';
import type { DayPeriod, EnergyLevel, EnergyProfile, TimeQuality } from '../../timeQuality';

export type DefaultView = 'calendar' | 'today' | 'insights';
export type ThemeId = 'soft-rose-glass' | 'violet-dusk' | 'blue-hour' | 'ember-noir';
export type AtmosphereTheme = 'dawn' | 'daylight' | 'twilight' | 'midnight';
export type AccentColour = 'rose' | 'lavender' | 'sage' | 'amber' | 'sky' | 'neutral';
export type WorkspaceMode = 'calm' | 'balanced' | 'planner';
export type TimeFormat = '12-hour' | '24-hour';
export type DefaultCalendarView = CalendarView;
export type DefaultEventDurationMinutes = 30 | 45 | 60 | 90;

export type AtriaProfile = {
  displayName: string;
  roleOrFocus?: string;
  avatarStyle: 'initials' | 'symbol';
};

export type LocalAccountSettings = {
  isSignedIn: boolean;
  createdAt?: string;
  lastSignedInAt?: string;
  lastSignedOutAt?: string;
};

export type AppearanceSettings = {
  atmosphere: AtmosphereTheme;
  accent: AccentColour;
  workspaceMode: WorkspaceMode;
};

export type CalendarBehaviourSettings = {
  weekStartsOn: 'monday' | 'sunday';
  defaultCalendarView: DefaultCalendarView;
  timeFormat: TimeFormat;
  defaultEventDurationMinutes: DefaultEventDurationMinutes;
  showWeekends: boolean;
  confirmBeforeDeleting: boolean;
  preservePlanningBuffers: boolean;
};

export type NotificationPreferences = {
  inAppDailyOverview: boolean;
  inAppReflectionPrompt: boolean;
  inAppWeeklySummary: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
};

export type OnboardingSettings = {
  hasCompleted: boolean;
  version: number;
};

export type SettingsPreferences = {
  schemaVersion: 3;
  account: LocalAccountSettings;
  profile: AtriaProfile;
  appearance: AppearanceSettings;
  calendar: CalendarBehaviourSettings;
  planningDefaults: {
    defaultItemType: CalendarItemType;
    defaultCategory: EventCategory;
    defaultView: DefaultView;
  };
  notifications: NotificationPreferences;
  onboarding: OnboardingSettings;
  energyProfile: EnergyProfile;
};

export type SettingsEnergyProfileUpdate = {
  period: DayPeriod;
  energy?: EnergyLevel;
  preferredQualities?: TimeQuality[];
};
