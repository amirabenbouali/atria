import { create } from 'zustand';
import {
  readStoredSettingsPreferences,
  writeStoredSettingsPreferences,
} from '../services/settingsStorage.service';
import type { SettingsPreferences } from '../types/settings.types';

type SettingsState = {
  preferences: SettingsPreferences;
  updatePreferences: (preferences: Partial<SettingsPreferences>) => void;
};

function persistPreferences(preferences: SettingsPreferences) {
  writeStoredSettingsPreferences(preferences);
  return preferences;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  preferences: readStoredSettingsPreferences(),
  updatePreferences: (nextPreferences) =>
    set((state) => ({
      preferences: persistPreferences({
        ...state.preferences,
        ...nextPreferences,
      }),
    })),
}));
