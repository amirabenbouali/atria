import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../../../shared/services/localStorage.service';
import { eventCategories } from '../../calendar/constants/calendar.constants';
import {
  defaultEnergyProfile,
  normalizeEnergyProfile,
} from '../../timeQuality';
import {
  defaultAccent,
  defaultAtmosphere,
  defaultWorkspaceMode,
  isAccentColour,
  isAtmosphereTheme,
  isWorkspaceMode,
  mapLegacyThemeToAtmosphere,
} from '../constants/theme.constants';
import type {
  AccentColour,
  AtmosphereTheme,
  CalendarBehaviourSettings,
  DefaultCalendarView,
  DefaultEventDurationMinutes,
  DefaultView,
  NotificationPreferences,
  SettingsPreferences,
  TimeFormat,
  WorkspaceMode,
} from '../types/settings.types';

const settingsStorageKey = 'atria-settings-preferences';
export const currentOnboardingVersion = 1;

export const defaultSettingsPreferences: SettingsPreferences = {
  schemaVersion: 2,
  profile: {
    displayName: 'Atria user',
    roleOrFocus: 'Focused planning',
    avatarStyle: 'symbol',
  },
  appearance: {
    atmosphere: defaultAtmosphere,
    accent: defaultAccent,
    workspaceMode: defaultWorkspaceMode,
  },
  calendar: {
    weekStartsOn: 'monday',
    defaultCalendarView: 'week',
    timeFormat: '24-hour',
    defaultEventDurationMinutes: 60,
    showWeekends: true,
    confirmBeforeDeleting: true,
    preservePlanningBuffers: true,
  },
  planningDefaults: {
    defaultItemType: 'event',
    defaultCategory: 'Work',
    defaultView: 'calendar',
  },
  notifications: {
    inAppDailyOverview: true,
    inAppReflectionPrompt: true,
    inAppWeeklySummary: false,
    quietHoursEnabled: false,
    quietHoursStart: '21:00',
    quietHoursEnd: '08:00',
  },
  onboarding: {
    hasCompleted: false,
    version: currentOnboardingVersion,
  },
  energyProfile: defaultEnergyProfile,
};

const defaultViews: DefaultView[] = ['calendar', 'today', 'insights'];
const calendarViews: DefaultCalendarView[] = ['day', 'week', 'month'];
const timeFormats: TimeFormat[] = ['12-hour', '24-hour'];
const eventDurations: DefaultEventDurationMinutes[] = [30, 45, 60, 90];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeText(value: unknown, fallback: string, maxLength: number) {
  const normalized = typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
  return normalized || fallback;
}

function normalizeOptionalText(value: unknown, maxLength: number) {
  const normalized = typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
  return normalized || undefined;
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeTime(value: unknown, fallback: string) {
  return typeof value === 'string' && /^\d{2}:\d{2}$/.test(value) ? value : fallback;
}

function normalizeAppearance(storedPreferences: Record<string, unknown>): SettingsPreferences['appearance'] {
  const appearance = asRecord(storedPreferences.appearance);
  const legacyAtmosphere = mapLegacyThemeToAtmosphere(storedPreferences.themeId);

  return {
    atmosphere: isAtmosphereTheme(appearance.atmosphere)
      ? appearance.atmosphere as AtmosphereTheme
      : legacyAtmosphere,
    accent: isAccentColour(appearance.accent)
      ? appearance.accent as AccentColour
      : defaultSettingsPreferences.appearance.accent,
    workspaceMode: isWorkspaceMode(appearance.workspaceMode)
      ? appearance.workspaceMode as WorkspaceMode
      : defaultSettingsPreferences.appearance.workspaceMode,
  };
}

function normalizeCalendar(storedPreferences: Record<string, unknown>): CalendarBehaviourSettings {
  const calendar = asRecord(storedPreferences.calendar);
  const legacyWeekStart =
    typeof storedPreferences.weekStartsOnMonday === 'boolean'
      ? (storedPreferences.weekStartsOnMonday ? 'monday' : 'sunday')
      : defaultSettingsPreferences.calendar.weekStartsOn;

  return {
    weekStartsOn: calendar.weekStartsOn === 'sunday' || calendar.weekStartsOn === 'monday'
      ? calendar.weekStartsOn
      : legacyWeekStart,
    defaultCalendarView: calendarViews.includes(calendar.defaultCalendarView as DefaultCalendarView)
      ? calendar.defaultCalendarView as DefaultCalendarView
      : defaultSettingsPreferences.calendar.defaultCalendarView,
    timeFormat: timeFormats.includes(calendar.timeFormat as TimeFormat)
      ? calendar.timeFormat as TimeFormat
      : defaultSettingsPreferences.calendar.timeFormat,
    defaultEventDurationMinutes: eventDurations.includes(calendar.defaultEventDurationMinutes as DefaultEventDurationMinutes)
      ? calendar.defaultEventDurationMinutes as DefaultEventDurationMinutes
      : defaultSettingsPreferences.calendar.defaultEventDurationMinutes,
    showWeekends: normalizeBoolean(calendar.showWeekends, defaultSettingsPreferences.calendar.showWeekends),
    confirmBeforeDeleting: normalizeBoolean(calendar.confirmBeforeDeleting, defaultSettingsPreferences.calendar.confirmBeforeDeleting),
    preservePlanningBuffers: normalizeBoolean(calendar.preservePlanningBuffers, defaultSettingsPreferences.calendar.preservePlanningBuffers),
  };
}

function normalizePlanningDefaults(storedPreferences: Record<string, unknown>): SettingsPreferences['planningDefaults'] {
  const planningDefaults = asRecord(storedPreferences.planningDefaults);
  const defaultItemType = planningDefaults.defaultItemType ?? storedPreferences.defaultItemType;
  const defaultCategory = planningDefaults.defaultCategory ?? storedPreferences.defaultCategory;
  const defaultView = planningDefaults.defaultView ?? storedPreferences.defaultView;

  return {
    defaultItemType: defaultItemType === 'task' ? 'task' : defaultSettingsPreferences.planningDefaults.defaultItemType,
    defaultCategory: eventCategories.includes(defaultCategory as SettingsPreferences['planningDefaults']['defaultCategory'])
      ? defaultCategory as SettingsPreferences['planningDefaults']['defaultCategory']
      : defaultSettingsPreferences.planningDefaults.defaultCategory,
    defaultView: defaultViews.includes(defaultView as DefaultView)
      ? defaultView as DefaultView
      : defaultSettingsPreferences.planningDefaults.defaultView,
  };
}

function normalizeNotifications(storedPreferences: Record<string, unknown>): NotificationPreferences {
  const notifications = asRecord(storedPreferences.notifications);

  return {
    inAppDailyOverview: normalizeBoolean(notifications.inAppDailyOverview, defaultSettingsPreferences.notifications.inAppDailyOverview),
    inAppReflectionPrompt: normalizeBoolean(notifications.inAppReflectionPrompt, defaultSettingsPreferences.notifications.inAppReflectionPrompt),
    inAppWeeklySummary: normalizeBoolean(notifications.inAppWeeklySummary, defaultSettingsPreferences.notifications.inAppWeeklySummary),
    quietHoursEnabled: normalizeBoolean(notifications.quietHoursEnabled, defaultSettingsPreferences.notifications.quietHoursEnabled),
    quietHoursStart: normalizeTime(notifications.quietHoursStart, defaultSettingsPreferences.notifications.quietHoursStart),
    quietHoursEnd: normalizeTime(notifications.quietHoursEnd, defaultSettingsPreferences.notifications.quietHoursEnd),
  };
}

function normalizePreferences(preferences: unknown): SettingsPreferences {
  const storedPreferences =
    preferences && typeof preferences === 'object' && !Array.isArray(preferences)
      ? preferences as Record<string, unknown>
      : {};
  const profile = asRecord(storedPreferences.profile);
  const onboarding = asRecord(storedPreferences.onboarding);
  const storedOnboardingVersion = Number(onboarding.version ?? storedPreferences.onboardingVersion);
  const hasCompletedOnboarding =
    storedOnboardingVersion === currentOnboardingVersion
      ? Boolean(onboarding.hasCompleted ?? storedPreferences.hasCompletedOnboarding)
      : false;

  return {
    schemaVersion: 2,
    profile: {
      displayName: normalizeText(profile.displayName, defaultSettingsPreferences.profile.displayName, 36),
      roleOrFocus: normalizeOptionalText(profile.roleOrFocus, 72),
      avatarStyle: profile.avatarStyle === 'initials' ? 'initials' : defaultSettingsPreferences.profile.avatarStyle,
    },
    appearance: normalizeAppearance(storedPreferences),
    calendar: normalizeCalendar(storedPreferences),
    planningDefaults: normalizePlanningDefaults(storedPreferences),
    notifications: normalizeNotifications(storedPreferences),
    onboarding: {
      hasCompleted: hasCompletedOnboarding,
      version: currentOnboardingVersion,
    },
    energyProfile: normalizeEnergyProfile(storedPreferences.energyProfile),
  };
}

export function readStoredSettingsPreferences() {
  return normalizePreferences(
    readJsonFromLocalStorage<Partial<SettingsPreferences>>(settingsStorageKey, defaultSettingsPreferences),
  );
}

export function writeStoredSettingsPreferences(preferences: SettingsPreferences) {
  writeJsonToLocalStorage(settingsStorageKey, preferences);
}
