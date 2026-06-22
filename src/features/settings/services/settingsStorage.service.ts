import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../../../shared/services/localStorage.service';
import { eventCategories } from '../../calendar/constants/calendar.constants';
import type { SettingsPreferences } from '../types/settings.types';

const settingsStorageKey = 'atria-settings-preferences';

export const defaultSettingsPreferences: SettingsPreferences = {
  weekStartsOnMonday: true,
  defaultItemType: 'event',
  defaultCategory: 'Work',
  defaultView: 'calendar',
};

function normalizePreferences(preferences: unknown): SettingsPreferences {
  const storedPreferences =
    preferences && typeof preferences === 'object' && !Array.isArray(preferences)
      ? preferences as Partial<SettingsPreferences>
      : {};

  return {
    weekStartsOnMonday: storedPreferences.weekStartsOnMonday ?? defaultSettingsPreferences.weekStartsOnMonday,
    defaultItemType: storedPreferences.defaultItemType === 'task' ? 'task' : defaultSettingsPreferences.defaultItemType,
    defaultCategory: eventCategories.includes(storedPreferences.defaultCategory as SettingsPreferences['defaultCategory'])
      ? storedPreferences.defaultCategory as SettingsPreferences['defaultCategory']
      : defaultSettingsPreferences.defaultCategory,
    defaultView: ['calendar', 'today', 'insights'].includes(storedPreferences.defaultView ?? '')
      ? storedPreferences.defaultView as SettingsPreferences['defaultView']
      : defaultSettingsPreferences.defaultView,
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
